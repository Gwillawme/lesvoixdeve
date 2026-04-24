export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://lesvoixdeve.ch');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { prenom, situation, duree, soutien, message, accord } = req.body;

  // Validation basique
  if (!prenom || !situation || !message || !accord) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const situationLabels = {
    'en-cours': 'Situation en cours',
    'sortie': 'Sortie de la situation',
    'reconstruction': 'En reconstruction',
    'entourage': "Membre de l'entourage",
    'professionnel': 'Professionnel·le',
  };

  const dureeLabels = {
    'moins-6-mois': 'Moins de 6 mois',
    '6-mois-2-ans': '6 mois à 2 ans',
    'plus-2-ans': 'Plus de 2 ans',
    'ne-sait-pas': 'Ne sait pas / Ne souhaite pas répondre',
  };

  const soutienLabels = {
    'ecoute': 'Écoute et soutien émotionnel',
    'guidance': 'Guidance dans les démarches',
    'accompagnement': 'Accompagnement physique',
    'groupe': 'Groupe de parole',
    'ressources': 'Ressources et informations',
    'autre': 'Autre',
  };

  const situationText = situationLabels[situation] || situation;
  const dureeText = dureeLabels[duree] || duree || 'Non renseigné';
  const soutienText = Array.isArray(soutien)
    ? soutien.map(s => soutienLabels[s] || s).join(', ')
    : soutienLabels[soutien] || soutien || 'Non renseigné';

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: Georgia, serif; background: #f9f6f2; color: #2d1b4e; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { background: #2d1b4e; padding: 32px 40px; }
  .header h1 { color: #c9a96e; font-size: 1.4rem; font-weight: 300; margin: 0; letter-spacing: 0.05em; }
  .header p { color: rgba(255,255,255,0.5); font-size: 0.8rem; margin: 6px 0 0; }
  .body { padding: 32px 40px; }
  .field { margin-bottom: 20px; }
  .label { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #c9a96e; margin-bottom: 4px; }
  .value { font-size: 0.95rem; color: #2d1b4e; line-height: 1.6; }
  .message-box { background: #f9f6f2; border-left: 3px solid #c9a96e; padding: 16px 20px; border-radius: 0 8px 8px 0; }
  .footer { background: #f9f6f2; padding: 20px 40px; font-size: 0.75rem; color: #999; border-top: 1px solid #eee; }
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Les Voix d'Ève — Nouvelle demande</h1>
    <p>Formulaire de contact · lesvoixdeve.ch</p>
  </div>
  <div class="body">
    <div class="field">
      <div class="label">Prénom</div>
      <div class="value">${prenom}</div>
    </div>
    <div class="field">
      <div class="label">Situation</div>
      <div class="value">${situationText}</div>
    </div>
    <div class="field">
      <div class="label">Durée de la situation</div>
      <div class="value">${dureeText}</div>
    </div>
    <div class="field">
      <div class="label">Type de soutien souhaité</div>
      <div class="value">${soutienText}</div>
    </div>
    <div class="field">
      <div class="label">Message</div>
      <div class="value message-box">${message.replace(/\n/g, '<br>')}</div>
    </div>
  </div>
  <div class="footer">
    Ce message a été envoyé depuis le formulaire de contact de lesvoixdeve.ch
  </div>
</div>
</body>
</html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Les Voix d\'Ève <contact@lesvoixdeve.ch>',
        to: ['lesvoixdeve@outlook.com'],
        subject: `Nouvelle demande de ${prenom} — Les Voix d'Ève`,
        html: htmlBody,
        reply_to: 'lesvoixdeve@outlook.com',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
