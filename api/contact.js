export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { prenom, canton, besoin, enfants, situation, modeContact, dispo, telephone, email } = req.body;

  if (!prenom || !canton || !besoin || !enfants || !modeContact || !dispo || !telephone) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: Georgia, serif; background: #f9f6f2; color: #2d1b4e; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { background: #2d1b4e; padding: 32px 40px; }
  .header h1 { color: #c9a96e; font-size: 1.3rem; font-weight: 300; margin: 0; letter-spacing: 0.05em; }
  .header p { color: rgba(255,255,255,0.45); font-size: 0.78rem; margin: 6px 0 0; }
  .body { padding: 32px 40px; }
  .field { margin-bottom: 18px; border-bottom: 1px solid #f0eae0; padding-bottom: 18px; }
  .field:last-child { border-bottom: none; }
  .label { font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: #c9a96e; margin-bottom: 5px; }
  .value { font-size: 0.92rem; color: #2d1b4e; line-height: 1.6; }
  .value.highlight { font-weight: bold; font-size: 1rem; }
  .message-box { background: #f9f6f2; border-left: 3px solid #c9a96e; padding: 14px 18px; border-radius: 0 8px 8px 0; font-style: italic; color: #555; }
  .footer-note { background: #f9f6f2; padding: 18px 40px; font-size: 0.72rem; color: #aaa; border-top: 1px solid #eee; }
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Les Voix d'Ève — Nouvelle demande d'accompagnement</h1>
    <p>Reçu via lesvoixdeve.ch/contact</p>
  </div>
  <div class="body">
    <div class="field">
      <div class="label">Prénom</div>
      <div class="value highlight">${prenom}</div>
    </div>
    <div class="field">
      <div class="label">Canton</div>
      <div class="value">${canton}</div>
    </div>
    <div class="field">
      <div class="label">Besoin exprimé</div>
      <div class="value">${besoin}</div>
    </div>
    <div class="field">
      <div class="label">Enfants concernés</div>
      <div class="value">${enfants}</div>
    </div>
    <div class="field">
      <div class="label">Mode de contact souhaité</div>
      <div class="value">${modeContact}</div>
    </div>
    <div class="field">
      <div class="label">Disponibilités</div>
      <div class="value">${dispo}</div>
    </div>
    <div class="field">
      <div class="label">Téléphone</div>
      <div class="value"><a href="tel:${telephone}" style="color:#2d1b4e;">${telephone}</a></div>
    </div>
    <div class="field">
      <div class="label">E-mail</div>
      <div class="value"><a href="mailto:${email}" style="color:#2d1b4e;">${email}</a></div>
    </div>
    ${situation ? `
    <div class="field">
      <div class="label">Situation décrite</div>
      <div class="value message-box">${situation.replace(/\n/g, '<br>')}</div>
    </div>` : ''}
  </div>
  <div class="footer-note">
    Message reçu depuis le formulaire de contact de lesvoixdeve.ch
  </div>
</div>
</body>
</html>`;

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
        subject: `Nouvelle demande de ${prenom} (${canton}) — Les Voix d'Ève`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Erreur envoi email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
