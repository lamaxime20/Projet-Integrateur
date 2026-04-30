<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
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
        .body {
            padding: 32px;
            color: #333333;
        }
        .body p {
            margin: 0 0 16px;
            font-size: 15px;
            line-height: 1.6;
        }
        .code-block {
            margin: 24px 0;
            text-align: center;
        }
        .code {
            display: inline-block;
            background-color: #f0f7f4;
            border: 2px solid #2d6a4f;
            border-radius: 8px;
            padding: 16px 40px;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 10px;
            color: #2d6a4f;
        }
        .warning {
            background-color: #fff8e1;
            border-left: 4px solid #f9a825;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            color: #555555;
            margin-top: 8px;
        }
        .notice {
            font-size: 13px;
            color: #888888;
            margin-top: 24px;
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
        </div>
        <div class="body">
            <p>Bonjour {{ $prenom }},</p>
            <p>Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte. Voici votre code :</p>
            <div class="code-block">
                <span class="code">{{ $code }}</span>
            </div>
            <p>Ce code est valable <strong>15 minutes</strong>.</p>
            <div class="warning">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.
            </div>
            <p class="notice">Pour votre sécurité, ne communiquez jamais ce code à quiconque.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Agrico-Tech. Tous droits réservés.
        </div>
    </div>
</body>
</html>
