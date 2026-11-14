/**
 * ARES: The Last Signal - Delayed Earth Communication Registry
 * 
 * Manages queued transmissions from Earth with 1–2 sol latency.
 * Supports stale message conditions and Houston advisory packets.
 */

export const COMM_MESSAGES = [
  {
    id: "msg_initial_handshake",
    sender: "Flight Director Chen // Houston MCC",
    subject: "Deep Space Network Telemetry Handshake",
    body: "ARES-1, we received your autonomous transition beacon. Madrid and Goldstone tracking stations are listening on X-band. Hold system stability and prioritize life support.",
    sentOnSol: 1,
    deliverOnSol: 3,
    validIf: null,
    staleVariant: null
  },
  {
    id: "msg_spe_advisory",
    sender: "Space Weather Bureau // Goddard",
    subject: "CME Proton Shower Advisory",
    body: "Solar dynamics observatory reports coronal mass ejection trajectory aligned with Mars. Retreat to underground storm shelters upon detection of particle wavefront.",
    sentOnSol: 12,
    deliverOnSol: 14,
    validIf: null,
    staleVariant: null
  },
  {
    id: "msg_conjunction_warning",
    sender: "Orbital Mechanics Desk // JPL",
    subject: "Solar Conjunction Communication Moratorium",
    body: "Sun-Mars-Earth alignment entering critical angle. Ionized solar corona will distort RF frequencies. Execute pre-programmed sequences and maintain autonomous command.",
    sentOnSol: 21,
    deliverOnSol: 23,
    validIf: null,
    staleVariant: null
  },
  {
    id: "msg_final_window",
    sender: "Deep Space Network // Goldstone Array",
    subject: "Final Carrier Window Schedule - Sol 30",
    body: "Final Earth alignment window verified for Sol 30, 14:00 UTC. Ensure 3.2m high-gain dish is calibrated to azimuth 114° and transmitter capacitors are energized.",
    sentOnSol: 28,
    deliverOnSol: 30,
    validIf: "antenna_aligned",
    staleVariant: "WARNING: Telemetry indicates high-gain antenna azimuth unverified. Realign dish immediately before attempting Sol 30 carrier broadcast."
  }
];
