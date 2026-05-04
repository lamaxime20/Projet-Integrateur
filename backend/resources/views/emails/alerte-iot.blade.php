<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerte capteur</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 480px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header {
            background-color: #2d6a4f;
            padding: 28px 32px;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            color: #b7e4c7;
            margin: 6px 0 0;
            font-size: 13px;
        }
        .body {
            padding: 32px;
            color: #333333;
        }
        .body p {
            margin: 0 0 16px;
            font-size: 15px;
            line-height: 1.6;
        }
        .alert-box {
            background-color: #fff3cd;
            border-left: 4px solid #e67e22;
            border-radius: 4px;
            padding: 16px 20px;
            margin: 24px 0;
        }
        .alert-box.critique {
            background-color: #fde8e8;
            border-left-color: #c0392b;
        }
        .alert-box .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888888;
            margin-bottom: 8px;
        }
        .alert-box .valeur {
            font-size: 32px;
            font-weight: 700;
            color: #c0392b;
            line-height: 1.1;
        }
        .alert-box .grandeur {
            font-size: 14px;
            color: #555555;
            margin-top: 4px;
        }
        .seuils {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
        }
        .seuils-row {
            display: table-row;
        }
        .seuils-cell {
            display: table-cell;
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
            text-align: center;
        }
        .seuils-cell.header-cell {
            background-color: #f4f4f4;
            font-weight: 700;
            font-size: 12px;
            color: #666666;
            text-transform: uppercase;
        }
        .device-badge {
            display: inline-block;
            background-color: #e8f5e9;
            border: 1px solid #c8e6c9;
            border-radius: 4px;
            padding: 4px 10px;
            font-size: 13px;
            color: #2d6a4f;
            font-weight: 600;
        }
        .notice {
            font-size: 13px;
            color: #888888;
            margin-top: 24px;
            line-height: 1.5;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 16px 32px;
            text-align: center;
            font-size: 12px;
            color: #aaaaaa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AGRICO-TECH</h1>
            <p>Système de surveillance IoT</p>
        </div>
        <div class="body">
            <p>Bonjour {{ $prenom }},</p>
            <p>
                Une anomalie a été détectée sur votre installation.
                Un capteur a relevé une valeur en dehors des seuils configurés.
            </p>

            @php
                $tropEleve = $valeur > $seuilMax;
                $direction = $tropEleve ? 'trop élevée' : 'trop basse';
            @endphp

            <div class="alert-box {{ $tropEleve ? 'critique' : '' }}">
                <div class="label">Valeur mesurée — {{ $direction }}</div>
                <div class="valeur">{{ $valeur }}{{ $unite }}</div>
                <div class="grandeur">{{ $grandeur }}</div>
            </div>

            <div class="seuils">
                <div class="seuils-row">
                    <div class="seuils-cell header-cell">Seuil minimum</div>
                    <div class="seuils-cell header-cell">Valeur reçue</div>
                    <div class="seuils-cell header-cell">Seuil maximum</div>
                </div>
                <div class="seuils-row">
                    <div class="seuils-cell">{{ $seuilMin }}{{ $unite }}</div>
                    <div class="seuils-cell" style="font-weight:700;color:#c0392b;">{{ $valeur }}{{ $unite }}</div>
                    <div class="seuils-cell">{{ $seuilMax }}{{ $unite }}</div>
                </div>
            </div>

            <p>
                Appareil concerné : <span class="device-badge">{{ $deviceId }}</span>
            </p>

            <p>
                Connectez-vous à votre tableau de bord pour consulter les données en temps réel
                et ajuster les seuils si nécessaire.
            </p>

            <p class="notice">
                Cet email a été envoyé automatiquement par le système de surveillance Agrico-Tech.
                Si vous recevez cette alerte par erreur, vérifiez la configuration de vos seuils.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Agrico-Tech. Tous droits réservés.
        </div>
    </div>
</body>
</html>
