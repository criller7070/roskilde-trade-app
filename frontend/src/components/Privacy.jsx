import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">Privatlivspolitik</h1>
        <p className="text-sm text-gray-600 mb-8">Sidst opdateret: {new Date().toLocaleDateString('da-DK')}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Dataansvarlig</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">RosSwap Uddannelsesprojekt</p>
              <p className="text-blue-700">
                Kontakt: Philipp Zhuravlev - philippzhuravlev@gmail.com<br />
                Kontakt: Christian Hyllested - crillerhylle@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Hvilke Data Indsamler Vi?</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-800">Data Vi Indsamler:</h3>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li><strong>Navn:</strong> Dit fulde navn (fra Google OAuth eller selvvalgt)</li>
                  <li><strong>E-mail:</strong> Din e-mailadresse (til login og kommunikation)</li>
                  <li><strong>Profilbillede:</strong> Dit profilbillede (fra Google eller uploadet)</li>
                  <li><strong>Opslag:</strong> Tekst og billeder i dine handelsposts</li>
                  <li><strong>Beskeder:</strong> Private beskeder med andre brugere</li>
                  <li><strong>Aktivitet:</strong> Hvilke opslag du liker/disliker</li>
                  <li><strong>Teknisk info:</strong> Browser-type ved fejlrapporter</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-800">Data Vi IKKE Indsamler:</h3>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  <li>Cookies eller tracking-teknologi</li>
                  <li>Din lokalitet eller GPS-data</li>
                  <li>Adgangskoder (håndteres af Firebase)</li>
                  <li>Betalingsoplysninger</li>
                  <li>Sociale medier-aktivitet uden for platformen</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Hvorfor Indsamler Vi Data?</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Nødvendige data (Artikel 6(1)(b) GDPR):</strong>
                <p className="text-gray-700 text-sm mt-1">Navn, e-mail og beskeder er nødvendige for at levere tjenesten - du kan ikke bruge platformen uden disse.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Legitime interesser (Artikel 6(1)(f) GDPR):</strong>
                <p className="text-gray-700 text-sm mt-1">Profilbilleder og aktivitetsdata forbedrer brugeroplevelsen og sikkerhed.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Samtykke (Artikel 6(1)(a) GDPR):</strong>
                <p className="text-gray-700 text-sm mt-1">Ved oprettelse af konto samtykker du til databehandling som beskrevet her.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Deling af Data</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold mb-2">Vi deler ALDRIG dine data med tredjeparter til kommercielle formål.</p>
              <p className="text-yellow-700 text-sm">
                Dine data gemmes i Google Firebase (USA) under deres sikkerhedsstandarder. 
                Vi kan være forpligtet til at dele data med danske myndigheder ved mistanke om ulovlige aktiviteter.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Dine GDPR-Rettigheder</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-500 mb-2">Ret til indsigt</h3>
                <p className="text-sm text-gray-700">Se alle data vi har om dig</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-500 mb-2">Ret til berigtigelse</h3>
                <p className="text-sm text-gray-700">Ret fejl i dine oplysninger</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-500 mb-2">Ret til sletning</h3>
                <p className="text-sm text-gray-700">Få slettet alle dine data</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-500 mb-2">Ret til dataportabilitet</h3>
                <p className="text-sm text-gray-700">Download dine data</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-500 mb-2">Ret til begrænsning</h3>
                <p className="text-sm text-gray-700">Begræns behandling af dine data</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-orange-500 mb-2">Ret til indsigelse</h3>
                <p className="text-sm text-gray-700">Gør indsigelse mod behandling</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">Sådan udøver du dine rettigheder:</p>
              <p className="text-green-700 text-sm mt-1">
                Gå til din profil og brug "Download mine data" eller "Slet min konto" funktionerne, 
                eller kontakt os direkte på philippzhuravlev@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Datasikkerhed</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Data gemmes i Google Firebase's sikre cloud-infrastruktur</li>
              <li>• Alle forbindelser er krypteret (HTTPS)</li>
              <li>• Kun autoriserede administratorer har adgang til data</li>
              <li>• Vi logger admin-aktiviteter for sikkerhedens skyld</li>
              <li>• Automatisk backup og redundans gennem Firebase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Opbevaring af Data</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li><strong>Aktive konti:</strong> Data gemmes så længe kontoen er aktiv</li>
                <li><strong>Slettede konti:</strong> Data slettes inden for 30 dage</li>
                <li><strong>Beskeder:</strong> Slettes når begge parter sletter deres konti</li>
                <li><strong>Fejlrapporter:</strong> Gemmes i maksimalt 1 år til fejlretning</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Børns Privatlivd</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">Aldersgrænse: 18 år</p>
              <p className="text-red-700 text-sm mt-1">
                RosSwap er kun beregnet til brugere over 18 år. Vi indsamler ikke bevidst data fra mindreårige. 
                Hvis vi opdager en mindreårig bruger, slettes kontoen øjeblikkeligt.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Ændringer til Denne Politik</h2>
            <p className="text-gray-700">
              Vi kan opdatere denne privatlivspolitik. Væsentlige ændringer meddeles via e-mail eller 
              prominente beskeder på platformen mindst 7 dage før ikrafttrædelse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Kontakt og Klager</h2>
            <div className="space-y-4">
              <div>
                <strong>Spørgsmål til privatlivspolitikken:</strong>
                <ul className="text-gray-700 mt-1 space-y-1">
                  <li>• Philipp Zhuravlev - philippzhuravlev@gmail.com</li>
                  <li>• Christian Hyllested - crillerhylle@gmail.com</li>
                </ul>
              </div>
              <div>
                <strong>Klager over databehandling:</strong>
                <p className="text-gray-700 text-sm">
                  Du kan klage til Datatilsynet i Danmark hvis du mener, vi behandler dine data forkert.
                  <br />
                  <a href="https://www.datatilsynet.dk" className="text-orange-500 underline">www.datatilsynet.dk</a>
                </p>
              </div>
            </div>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 italic">
              Denne privatlivspolitik er udarbejdet i overensstemmelse med GDPR for et uddannelsesprojekt. 
              Vi tager databeskyttelse seriøst og bestræber os på at overholde alle relevante love og regler.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 