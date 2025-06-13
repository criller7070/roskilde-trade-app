import React from "react";

const team = [
  { name: "Hannah Lund", img: "/team/Hannah.jpg" },
  { name: "Lilian Osman", img: "/team/Lilian.jpg" },
  { name: "Philipp Zhuravlev", img: "/team/Philipp.jpg" },
  { name: "Christian Hyllested", img: "/team/Criller.png" },
  { name: "Akkash Vigneswaran", img: "/team/Akkash.jpg" },
];

export default function About() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 text-center">
      <h1 className="text-2xl font-bold text-orange-500 mb-2">Om Os</h1>
      <p className="text-gray-700 mb-4">
        ! Hej ! <br />
        Først og fremmest tak for du bruger vores app. Vi håber du kan lide den og den lever op til dine forventninger.
        Vi er 5 studerende fra DTU som studerer IT og økonomi.
      </p>

      {/* Team Images */}
      <div className="flex justify-center gap-4 mb-1 overflow-x-auto">
        {team.map((person) => (
          <div key={person.name} className="flex flex-col items-center text-xs">
            <img src={person.img} alt={person.name} className="w-14 h-14 rounded-full object-cover" />
            <span className="mt-1">{person.name}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl text-orange-500 mt-6 mb-2 font-semibold">Vores Rejse</h2>
      <p className="text-gray-600 text-sm mb-3">
        Det hele startede i byen ... ignorer den sorte mand i midten
      </p>

      <img src="/team/group.png" alt="Team photo" className="rounded-lg mb-3" />

      <p className="text-gray-700 text-sm">
        Her fandt vi på ideen om at lave RosSwap. Sammen med DTU som havde et samarbejde med Roskilde festival, fik vi
        lov til at lave denne fede app som du bruger lige nu!!!
      </p>
    </div>
  );
}
