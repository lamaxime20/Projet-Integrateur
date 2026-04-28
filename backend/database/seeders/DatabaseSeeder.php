<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use App\Models\Grandeur;
use App\Models\Microcontroleur;
use App\Models\Capteur;
use App\Models\Actionneur;
use App\Models\Seuil;
use App\Models\Alerte;
use App\Models\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer les grandeurs physiques
        $grandeurs = [
            ['name' => 'Température'],
            ['name' => 'Humidité'],
            ['name' => 'Pression'],
            ['name' => 'Luminosité'],
            ['name' => 'Vitesse'],
            ['name' => 'Densité'],
        ];

        foreach ($grandeurs as $grandeur) {
            Grandeur::create($grandeur);
        }

        $grandeursCollection = Grandeur::all();

        // Créer des utilisateurs
        $utilisateurs = Utilisateur::factory(5)->create();

        // Créer des microcontrôleurs
        $microcontroleurs = Microcontroleur::factory(10)
            ->state(function () use ($utilisateurs) {
                return [
                    'user_id' => $utilisateurs->random()->id,
                ];
            })
            ->create();

        // Créer des capteurs
        $capteurs = collect();
        foreach (range(1, 20) as $_) {
            $capteurs->push(
                Capteur::factory()->create([
                    'microcontroleur_id' => $microcontroleurs->random()->id,
                    'type_mesure' => $grandeursCollection->random()->id,
                ])
            );
        }

        // Créer des actionneurs
        $actionneurs = Actionneur::factory(15)
            ->state(function () use ($microcontroleurs) {
                return [
                    'microcontroleur_id' => $microcontroleurs->random()->id,
                ];
            })
            ->create();

        // Créer des seuils
        $seuils = collect();
        foreach (range(1, 15) as $_) {
            $seuils->push(
                Seuil::factory()->create([
                    'user_id' => $utilisateurs->random()->id,
                    'microcontroleur_id' => $microcontroleurs->random()->id,
                    'type_mesure' => $grandeursCollection->random()->id,
                ])
            );
        }

        // Créer des alertes
        Alerte::factory(30)
            ->state(function () use ($utilisateurs) {
                return [
                    'user_id' => $utilisateurs->random()->id,
                ];
            })
            ->create();

        // Créer des données via les capteurs
        foreach ($capteurs as $capteur) {
            $capteur->donnees()->createMany(
                \Database\Factories\DonneeFactory::new()
                    ->count(5)
                    ->make()
                    ->toArray()
            );
        }

        // Créer des instructions
        \App\Models\Instruction::factory(20)
            ->state(function () use ($utilisateurs, $actionneurs) {
                return [
                    'user_id' => $utilisateurs->random()->id,
                    'actionneur_id' => $actionneurs->random()->id,
                ];
            })
            ->create();

        // Créer des logs
        Log::factory(50)->create();

        // Créer des tokens pour les microcontrôleurs
        foreach ($microcontroleurs as $microcontroleur) {
            $microcontroleur->tokens()->createMany(
                \Database\Factories\MicrocontroleurTokenFactory::new()
                    ->count(2)
                    ->make()
                    ->toArray()
            );
        }

        // Créer des sessions
        \App\Models\Session::factory(10)
            ->state(function () use ($utilisateurs) {
                return [
                    'user_id' => $utilisateurs->random()->id,
                ];
            })
            ->create();

        // Créer des codes de réinitialisation de mot de passe
        \App\Models\ResetPasswordCode::factory(10)
            ->state(function () use ($utilisateurs) {
                return [
                    'user_id' => $utilisateurs->random()->id,
                ];
            })
            ->create();
    }
}
