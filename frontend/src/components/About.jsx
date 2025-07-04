import React from "react";
import LoadingPlaceholder from "./LoadingPlaceholder";
import { useTranslation } from "react-i18next";

const team = [
  { name: "Hannah Lund", img: "/team/Hannah.jpg" },
  { name: "Lilian Osman", img: "/team/Lilian.png" },
  { name: "Philipp Zhuravlev", img: "/team/Philipp.png" },
  { name: "Christian Hyllested", img: "/team/Criller.png" },
  { name: "Akkash Vigneswaran", img: "/team/Akkash.jpg" },
];

export default function About() {
  const { t } = useTranslation("about");

  return (
    <div className="bg-orange-50 min-h-screen py-10 px-4 text-center">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">{t("aboutTeamTitle")}</h1>

        <p className="text-gray-800 text-lg leading-relaxed mb-6">
          {t("aboutTeamDescription1")}
        </p>

        <p className="text-gray-800 text-lg leading-relaxed mb-10">
          {t("aboutTeamDescription2")}
        </p>
      </div>

      <h2 className="text-lg font-medium text-gray-800 mb-4">{t("ourTeamHeading")}</h2>

      <div className="flex flex-wrap justify-center gap-6 mb-10">
        {team.map((person) => (
          <div key={person.name} className="flex flex-col items-center text-sm w-24">
            <LoadingPlaceholder
              src={person.img}
              alt={person.name}
              className="w-20 h-20 rounded-full object-cover shadow-sm"
              placeholderClassName="rounded-full"
            />
            <span className="mt-2 text-wrap">{person.name}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-700 text-base font-medium mb-3 max-w-xl mx-auto">
        {t("aboutTeamIdea")}
      </p>

      <div className="mb-6">
        <LoadingPlaceholder
          src="/team/group.png"
          alt={t("teamPhotoAlt")}
          className="rounded-xl shadow-md w-full max-w-md mx-auto"
          placeholderClassName="rounded-xl"
        />
      </div>

      <p className="text-gray-800 text-base max-w-xl mx-auto leading-relaxed">
        {t("aboutTeamConclusion")}
      </p>
    </div>
  );
}