const nodemailer = require("nodemailer");

// Create transporter — uses Gmail by default, swap for any SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // use Gmail App Password, not your real password
    },
  });
};

// ── Base HTML template ────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'DM Sans', Arial, sans-serif; color: #f0ede6; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #141414; border-radius: 16px; padding: 40px; border: 1px solid #1e1e1e; }
    .logo { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; color: #f0ede6; margin-bottom: 32px; }
    .title { font-size: 1.4rem; font-weight: 700; margin: 0 0 12px; color: #f0ede6; }
    .body { color: #888; font-size: 0.9rem; line-height: 1.7; margin: 0 0 24px; }
    .highlight { color: #e8c547; font-weight: 700; }
    .btn { display: inline-block; background: #e8c547; color: #0a0a0a; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.9rem; margin-bottom: 24px; }
    .divider { border: none; border-top: 1px solid #1e1e1e; margin: 24px 0; }
    .meta { color: #444; font-size: 0.75rem; line-height: 1.6; }
    .badge { display: inline-block; background: #e8c54722; color: #e8c547; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 600; margin-bottom: 20px; }
    .amount { font-size: 2rem; font-weight: 800; color: #e8c547; margin: 16px 0; }
    .footer { text-align: center; color: #333; font-size: 0.75rem; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">AUCTIONEER</div>
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Auctioneer · You're receiving this because you have an account with us.
    </div>
  </div>
</body>
</html>
`;

// ── Email senders ─────────────────────────────────────────────────────────────

// 1. Outbid notification → sent to previous highest bidder
const sendOutbidEmail = async ({ to, name, auctionTitle, auctionId, newBidAmount, yourBidAmount }) => {
  const transporter = createTransporter();
  const auctionUrl = `${process.env.CLIENT_URL}/auctions/${auctionId}`;

  await transporter.sendMail({
    from: `"Auctioneer" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚡ You've been outbid on "${auctionTitle}"`,
    html: baseTemplate(`
      <div class="badge">⚡ Outbid Alert</div>
      <h1 class="title">Someone outbid you!</h1>
      <p class="body">Hi ${name}, someone just placed a higher bid on an auction you're watching.</p>
      <p class="body"><strong style="color:#f0ede6">${auctionTitle}</strong></p>
      <p class="body">
        Your bid: <span style="color:#888">$${yourBidAmount.toLocaleString()}</span><br/>
        New highest bid: <span class="highlight">$${newBidAmount.toLocaleString()}</span>
      </p>
      <a href="${auctionUrl}" class="btn">Bid Again →</a>
      <hr class="divider"/>
      <p class="meta">Act fast — the auction may be ending soon.</p>
    `),
  });
};

// 2. Auction won → sent to winning bidder
const sendAuctionWonEmail = async ({ to, name, auctionTitle, auctionId, winningBid }) => {
  const transporter = createTransporter();
  const auctionUrl = `${process.env.CLIENT_URL}/auctions/${auctionId}`;

  await transporter.sendMail({
    from: `"Auctioneer" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🏆 You won "${auctionTitle}"!`,
    html: baseTemplate(`
      <div class="badge">🏆 Auction Won</div>
      <h1 class="title">Congratulations, ${name}!</h1>
      <p class="body">You've won the auction for:</p>
      <p class="body"><strong style="color:#f0ede6">${auctionTitle}</strong></p>
      <div class="amount">$${winningBid.toLocaleString()}</div>
      <a href="${auctionUrl}" class="btn">View Auction →</a>
      <hr class="divider"/>
      <p class="meta">The seller has been notified. They will reach out to arrange delivery.</p>
    `),
  });
};

// 3. Item sold → sent to consignor/seller
const sendItemSoldEmail = async ({ to, name, auctionTitle, auctionId, soldPrice, winnerName, totalBids }) => {
  const transporter = createTransporter();
  const auctionUrl = `${process.env.CLIENT_URL}/auctions/${auctionId}`;

  await transporter.sendMail({
    from: `"Auctioneer" <${process.env.EMAIL_USER}>`,
    to,
    subject: `💰 Your item "${auctionTitle}" has sold!`,
    html: baseTemplate(`
      <div class="badge">💰 Item Sold</div>
      <h1 class="title">Your item sold!</h1>
      <p class="body">Great news, ${name}! Your auction has ended successfully.</p>
      <p class="body"><strong style="color:#f0ede6">${auctionTitle}</strong></p>
      <div class="amount">$${soldPrice.toLocaleString()}</div>
      <p class="body">
        Winner: <span class="highlight">${winnerName}</span><br/>
        Total bids received: <span style="color:#f0ede6">${totalBids}</span>
      </p>
      <a href="${auctionUrl}" class="btn">View Auction →</a>
      <hr class="divider"/>
      <p class="meta">Please contact the buyer to arrange payment and delivery.</p>
    `),
  });
};

// 4. Auction ending soon → sent to all active bidders
const sendEndingSoonEmail = async ({ to, name, auctionTitle, auctionId, currentPrice, minutesLeft }) => {
  const transporter = createTransporter();
  const auctionUrl = `${process.env.CLIENT_URL}/auctions/${auctionId}`;

  await transporter.sendMail({
    from: `"Auctioneer" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏱ "${auctionTitle}" ends in ${minutesLeft} minutes!`,
    html: baseTemplate(`
      <div class="badge">⏱ Ending Soon</div>
      <h1 class="title">Hurry — auction ending soon!</h1>
      <p class="body">Hi ${name}, an auction you're participating in is about to end.</p>
      <p class="body"><strong style="color:#f0ede6">${auctionTitle}</strong></p>
      <p class="body">
        Current bid: <span class="highlight">$${currentPrice.toLocaleString()}</span><br/>
        Time left: <span style="color:#e55555; font-weight:700">${minutesLeft} minutes</span>
      </p>
      <a href="${auctionUrl}" class="btn">Place Your Bid →</a>
      <hr class="divider"/>
      <p class="meta">Don't miss your chance to win!</p>
    `),
  });
};

// 5. Auction ended with no bids → sent to seller
const sendNoSaleEmail = async ({ to, name, auctionTitle, auctionId }) => {
  const transporter = createTransporter();
  const auctionUrl = `${process.env.CLIENT_URL}/auctions/${auctionId}`;

  await transporter.sendMail({
    from: `"Auctioneer" <${process.env.EMAIL_USER}>`,
    to,
    subject: `📦 Your auction "${auctionTitle}" ended with no bids`,
    html: baseTemplate(`
      <div class="badge">📦 Auction Ended</div>
      <h1 class="title">Your auction ended</h1>
      <p class="body">Hi ${name}, your auction for <strong style="color:#f0ede6">${auctionTitle}</strong> has ended without receiving any bids.</p>
      <a href="${auctionUrl}" class="btn">View Auction →</a>
      <hr class="divider"/>
      <p class="meta">You can create a new listing anytime from your dashboard.</p>
    `),
  });
};

module.exports = {
  sendOutbidEmail,
  sendAuctionWonEmail,
  sendItemSoldEmail,
  sendEndingSoonEmail,
  sendNoSaleEmail,
};
