import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">Vilkår og Betingelser</h1>
        <p className="text-sm text-gray-600 mb-8">Sidst opdateret: {new Date().toLocaleDateString('da-DK')}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Om RosSwap</h2>
            <p className="text-gray-700">
              RosSwap muliggør kontakt mellem brugere, der ønsker at bytte eller handle varer, mad og tjenester, særligt i forbindelse med Roskilde Festival 2025 og dets arealer, samt omegn.
            </p>
            <p className="text-gray-700 mb-4">
              RosSwap er et <strong>ikke-kommercielt skoleprojekt</strong> udviklet som et samarbejde mellem studerende på Dansk Teknisk Universitet ("DTU") og Roskilde Festival. 
              Platformen er <strong>ikke officielt tilknyttet Roskilde Festival</strong> og drives udelukkende i et uddannelsesmæssigt og non-profit øjemed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Forbudte Varer og Tjenester</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">Strengt Forbudt:</h3>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                <li>Ulovlige stoffer og narkotika</li>
                <li>Våben og farlige genstande</li>
                <li>Seksuelle ydelser (uanset form og betaling)</li>
                <li>Falske, stjålne eller svindelrelaterede varer</li>
                <li>Salg eller udlevering af alkohol til mindreårige</li>
                <li>Receptpligtig medicin uden tilladelse</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Overtrædelse medfører <strong>øjeblikkelig suspension</strong> og kan <strong>anmeldes til myndighederne</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Brugeransvar</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• Du er ansvarlig for dine egne opslag og transaktioner</li>
              <li>• Du skal være mindst 18 år</li>
              <li>• Du skal angive korrekte oplysninger</li>
              <li>• Du accepterer at modtage beskeder fra andre brugere</li>
              <li>• Al brug sker på eget ansvar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Platformens Ansvar</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Vigtigt:</strong> RosSwap fungerer kun som en kontaktplatform. Vi:
              </p>
              <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                <li>Garanterer ikke for varernes kvalitet eller tilstand</li>
                <li>Er ikke ansvarlige for tvister mellem brugere</li>
                <li>Kan ikke garantere oppetid eller fejlfri funktion</li>
                <li>Forbeholder os retten til at lukke tjenesten uden varsel</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Moderation og Håndhævelse</h2>
            <p className="text-gray-700 mb-4">
              Vi forbeholder os retten til at:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Fjerne opslag der overtræder disse vilkår</li>
              <li>Suspendere eller lukke brugerkonti</li>
              <li>Anmelde ulovlig aktivitet til myndigheder</li>
              <li>Opdatere vilkårene med 7 dages varsel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Persondata</h2>
            <p className="text-gray-700">
              Vi behandler dine oplysninger i overensstemmelse med vores{' '}
              <a href="/privacy" className="text-orange-500 underline">privatlivspolitik</a>.
              Ved at bruge RosSwap samtykker du til denne behandling.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Kontakt</h2>
            <p className="text-gray-700">
              Spørgsmål til disse vilkår kan sendes til:
            </p>
            <ul className="text-gray-700 mt-2 space-y-1">
              <li>• Philipp Zhuravlev - philippzhuravlev@gmail.com</li>
              <li>• Christian Hyllested - crillerhylle@gmail.com</li>
            </ul>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 italic">
              Disse vilkår er udarbejdet som del af et studieprojekt og er ikke juridisk bindende i kommerciel forstand. 
              Ved brug af platformen accepterer du disse vilkår og bidrager til et trygt fællesskab.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
