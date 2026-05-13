export function runNDT(participants) {
  const eligible = participants.filter((p) => p.is_eligible);
  const participating = participants.filter((p) => p.is_participating);
  const hceAll = participants.filter((p) => p.is_hce);
  const nhceAll = participants.filter((p) => !p.is_hce);
  const hceEligible = eligible.filter((p) => p.is_hce);
  const nhceEligible = eligible.filter((p) => !p.is_hce);
  const hceParticipating = participating.filter((p) => p.is_hce);
  const nhceParticipating = participating.filter((p) => !p.is_hce);
  const keyParticipating = participating.filter((p) => p.is_key_employee);

  const hceEligRate = hceAll.length > 0 ? hceEligible.length / hceAll.length : 1;
  const nhceEligRate = nhceAll.length > 0 ? nhceEligible.length / nhceAll.length : 1;
  const eligibilityPass =
    nhceEligRate >= 0.70 || (hceEligRate > 0 && nhceEligRate >= hceEligRate * 0.70);

  const hcePartRate = hceEligible.length > 0 ? hceParticipating.length / hceEligible.length : 0;
  const nhcePartRate = nhceEligible.length > 0 ? nhceParticipating.length / nhceEligible.length : 0;
  const benefitsPass = hcePartRate === 0 || nhcePartRate >= hcePartRate * 0.70;

  const keyConcentration = participating.length > 0 ? keyParticipating.length / participating.length : 0;
  const concentrationPass = keyConcentration <= 0.25;

  const avgElection = (arr) => {
    const electors = arr.filter((p) => p.is_participating);
    if (!electors.length) return 0;
    const total = electors.reduce((sum, p) => {
      return sum + (p.fsa_election || 0) + (p.dcap_election || 0) + (p.premium_only_election || 0);
    }, 0);
    return total / electors.length;
  };

  const hceAvgElection = avgElection(hceAll);
  const nhceAvgElection = avgElection(nhceAll);
  const adpTestApplicable = hceAvgElection > 0 || nhceAvgElection > 0;
  const adpPass = !adpTestApplicable || nhceAvgElection === 0
    ? true
    : hceAvgElection <= nhceAvgElection * 1.25;

  const allPass = eligibilityPass && benefitsPass && concentrationPass && adpPass;

  return {
    eligibilityPass,
    benefitsPass,
    concentrationPass,
    adpPass,
    adpTestApplicable,
    overall: allPass ? "pass" : "fail",
    stats: {
      totalParticipants: participants.length,
      eligibleCount: eligible.length,
      participatingCount: participating.length,
      hceCount: hceAll.length,
      nhceCount: nhceAll.length,
      hceEligRate: pct(hceEligRate),
      nhceEligRate: pct(nhceEligRate),
      hcePartRate: pct(hcePartRate),
      nhcePartRate: pct(nhcePartRate),
      keyConcentration: pct(keyConcentration),
      hceAvgElection: Math.round(hceAvgElection),
      nhceAvgElection: Math.round(nhceAvgElection),
      adpRatio: nhceAvgElection > 0 ? Math.round((hceAvgElection / nhceAvgElection) * 100) / 100 : null,
    },
  };
}

function pct(val) {
  return Math.round(val * 100);
}