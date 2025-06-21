import React, { useState, useEffect } from 'react';

interface WaiverAgreementProps {
  onAccept: (waiverData: {
    participantName: string;
    guardianName?: string;
    date: string;
  }) => void;
}

export const WaiverAgreement: React.FC<WaiverAgreementProps> = ({ onAccept }) => {
  const [participantName, setParticipantName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const handleContinue = () => {
    if (!participantName.trim()) {
      setError('Participant name is required.');
      return;
    }
    if (isMinor && !guardianName.trim()) {
      setError('Parent/Guardian name is required for minors.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the waiver.');
      return;
    }
    setError('');
    onAccept({
      participantName,
      guardianName: isMinor ? guardianName : undefined,
      date: today,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Zek's Surf School Liability Waiver and Release Form</h2>
      <div className="max-h-64 overflow-y-auto border p-4 rounded mb-4 text-sm text-gray-700 whitespace-pre-line" style={{ background: '#f9fafb' }}>
        <strong>PLEASE READ CAREFULLY BEFORE SIGNING. THIS IS A RELEASE OF LIABILITY AND WAIVER OF CERTAIN LEGAL RIGHTS.</strong>

        {`

In consideration for being allowed to participate in surf lessons or any other beach-related activities provided by Zek's Surf School ("we," "our," or "us"), the undersigned participant (or the participant's legal guardian if under 18) agrees as follows:

---

1. Definitions

* Participant: The individual signing this form or, if under 18, the individual on whose behalf a guardian signs.
* Activities: Surf lessons, ocean swims, board handling, beach orientation, any related instruction or recreational activity.

---

2. Acknowledgment and Assumption of Risk

I understand that participation in Activities involves inherent risks, including but not limited to:
* Drowning, near-drowning, or other water-related injuries
* Impact with boards, other participants, or objects in the water
* Marine wildlife encounters
* Changing weather, tides, and currents
* Sun exposure, rip currents, and uneven seabed

I voluntarily assume all known and unknown risks of injury or death arising out of or related to my participation.

---

3. Participant Certification

I certify that I (or my child) am physically fit and have no medical or physical conditions that would prevent safe participation. I agree to inform instructors of any health issues before each session.

---

4. Release and Waiver of Liability

To the fullest extent permitted by law, I release and hold harmless Zek's Surf School, its owners, instructors, employees, agents, and affiliates from any and all claims, liabilities, demands, or causes of action, whether known or unknown, arising out of or related to any loss, damage, injury, or death incurred by me or my child during or after participation.

---

5. Indemnification

I agree to indemnify and defend Zek's Surf School against any claims brought by third parties arising out of my (or my child's) actions during Activities.

---

6. Compliance with Instructions

I agree to follow all instructions, safety guidelines, and rules provided by instructors. I understand that failure to comply may result in removal from Activities without refund.

---

7. Media Release

I grant permission for Zek's Surf School to use photographs or videos of me (or my child) taken during Activities for promotional, educational, or commercial purposes without compensation.

---

8. Emergency Medical Authorization

I authorize Zek's Surf School to secure emergency medical treatment if I am incapacitated. I agree to pay all costs incurred for medical treatment and transportation.

---

9. Severability

If any provision of this agreement is found unenforceable, the remaining provisions remain in full force and effect.

---

10. Governing Law

This agreement is governed by the laws of the State of California. Any disputes shall be resolved in the appropriate California court.

---

11. Electronic Signature

By signing below, I acknowledge I have read, understood, and voluntarily agree to all terms. I confirm this waiver is signed before participation in any Activities.
`}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Participant Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
          value={participantName}
          onChange={e => setParticipantName(e.target.value)}
          placeholder="Enter participant's full name"
        />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={isMinor}
          onChange={e => setIsMinor(e.target.checked)}
          id="isMinor"
        />
        <label htmlFor="isMinor" className="text-sm text-gray-700">Participant is under 18</label>
      </div>
      {isMinor && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1DA9C7] focus:border-[#1DA9C7]"
            value={guardianName}
            onChange={e => setGuardianName(e.target.value)}
            placeholder="Enter parent/guardian's full name"
          />
        </div>
      )}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          id="agreed"
        />
        <label htmlFor="agreed" className="text-sm text-gray-700">I have read and agree to the waiver above.</label>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-500">Date</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
          value={today}
          readOnly
        />
      </div>
      {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}
      <button
        className="w-full bg-[#1DA9C7] text-white py-3 rounded-lg font-semibold hover:bg-[#1897B2] transition-colors disabled:opacity-50"
        onClick={handleContinue}
        disabled={!participantName || (isMinor && !guardianName) || !agreed}
      >
        Continue
      </button>
    </div>
  );
}; 