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
              RosSwap muliggør kontakt mellem brugere, der ønsker at bytte eller handle varer og tjenester, særligt i forbindelse med Roskilde Festival 2025 og dets arealer, samt omegn.
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Sikkerhedsretningslinjer og Handel</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Tjek Lovligheden</h3>
                <p className="text-blue-700 mb-2">
                  <strong>Det er dit ansvar som køber og sælger at sikre, at alle varer og tjenester er lovlige:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Undersøg selv om varen må handles lovligt</li>
                  <li>Respektér aldersgrænser (alkohol, tobak, etc.)</li>
                  <li>Tjek om der kræves tilladelser eller licenser</li>
                  <li>Ved tvivl - spørg eller lad være med at indgå aftalen!</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Rapporter Mistænkelig Aktivitet</h3>
                <p className="text-orange-700 mb-2">
                  Hjælp med at holde platformen sikker:
                </p>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  <li>Brug flag-funktionen (🚩) til at rapportere upassende opslag</li>
                  <li>Anmeld opslag der bryder loven eller vores regler</li>
                  <li>Kontakt os ved alvorlige overtredelser</li>
                  <li>Bliv ikke involveret i tvivlsomme handeler</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Mad og Drikkevarer</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li><strong>Køb KUN forseglede/uåbnede fødevarer</strong></li>
                  <li>Tjek holdbarhedsdatoer før køb</li>
                  <li>Undgå hjemmelavede produkter fra fremmede</li>
                  <li>Vær ekstra forsigtig med mælkeprodukter og kød</li>
                  <li>Ved tvivl om fødevaresikkerhed - lad være med at indgå aftalen!</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Medicin og Sundhedsprodukter</h3>
                <ul className="list-disc list-inside text-purple-700 space-y-1">
                  <li><strong>Køb KUN forseglede/uåbnede produkter</strong></li>
                  <li>Tjek udløbsdatoer nøje</li>
                  <li>Receptpligtig medicin må IKKE handles</li>
                  <li>Vær forsigtig med vitaminer og kosttilskud</li>
                  <li>Spørg en farmaceut ved tvivl</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Sikre Møder og Transaktioner</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Mød op offentlige steder med mange mennesker</li>
                  <li>Tag en ven med, hvis muligt</li>
                  <li>Fortæl nogen hvor du skal hen</li>
                  <li>Betal ikke på forhånd til ukendte</li>
                  <li>Stol på din mavefornemmelse</li>
                  <li>Forlad situationen hvis noget føles forkert</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Vigtige Påmindelser</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>RosSwap er ikke ansvarlige for handel mellem brugere</li>
                  <li>Vi garanterer ikke for varernes kvalitet eller sikkerhed</li>
                  <li>Al handel sker på eget ansvar og risiko</li>
                  <li>Ved problemer, kontakt politiet ikke RosSwap</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Platformens Ansvar</h2>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Moderation og Håndhævelse</h2>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Persondata</h2>
            <p className="text-gray-700">
              Vi behandler dine oplysninger i overensstemmelse med vores{' '}
              <a href="/privacy" className="text-orange-500 underline">privatlivspolitik</a>.
              Ved at bruge RosSwap samtykker du til denne behandling.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Kontakt</h2>
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
