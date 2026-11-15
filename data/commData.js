/**
 * ARES: The Last Signal - Earth Communication Registry (v3)
 * 
 * Manages queued transmissions received from Earth.
 * Remember: our backup antenna can *listen*, but Earth cannot hear us
 * until the dish is aligned and beacon unlocked!
 * Sentences <= 18 words. Easy words.
 */

export const COMM_MESSAGES = [
  {
    id: "msg_initial_handshake",
    sender: "Flight Director Chen · Houston",
    subject: "We Are Listening for You",
    body: "ARES-1, our big tracking dishes in California and Spain are listening. Stay calm, protect your air and water, and fix that antenna.",
    sentOnSol: 1,
    deliverOnSol: 3,
    validIf: null,
    staleVariant: null
  },
  {
    id: "msg_spe_advisory",
    sender: "Space Weather Desk · NASA Goddard",
    subject: "Solar Storm Warning Coming Your Way",
    body: "A solar storm is speeding toward Mars. When alarms buzz, get everyone into the thick shelter.",
    sentOnSol: 12,
    deliverOnSol: 14,
    validIf: null,
    staleVariant: null
  },
  {
    id: "msg_conjunction_warning",
    sender: "Flight Director Chen · Houston",
    subject: "Sun Blocking Our Radios Soon",
    body: "The Sun is moving between Earth and Mars. Radio waves cannot push through hot solar gas. Follow your saved checklists.",
    sentOnSol: 21,
    deliverOnSol: 23,
    validIf: null,
    staleVariant: null
  },
  {
    id: "msg_final_window",
    sender: "Deep Space Network · Goldstone Station",
    subject: "Sol 30 Final Broadcast Window",
    body: "The rescue ship is waiting for your signal! Point your dish toward Earth on Sol 30. We are ready to receive your carrier wave.",
    sentOnSol: 28,
    deliverOnSol: 30,
    validIf: "antenna_aligned",
    staleVariant: "WARNING: We cannot detect your dish beacon! Make sure your antenna is aimed toward Earth before Sol 30!"
  }
];
