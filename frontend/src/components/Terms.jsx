import React from 'react';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const { t } = useTranslation("terms");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">{t("title")}</h1>
        <p className="text-sm text-gray-600 mb-8">{t("lastUpdated", { date: new Date().toLocaleDateString('da-DK') })}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("about.title")}</h2>
            <p className="text-gray-700">{t("about.description1")}</p>
            <p className="text-gray-700 mb-4">{t("about.description2")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("prohibited.title")}</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">{t("prohibited.strictlyForbidden")}</h3>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                {t("prohibited.items", { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="text-gray-700">{t("prohibited.consequences")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("userResponsibility.title")}</h2>
            <ul className="space-y-3 text-gray-700">
              <li>• {t("userResponsibility.point1")}</li>
              <li>• {t("userResponsibility.point2")}</li>
              <li>• {t("userResponsibility.point3")}</li>
              <li>• {t("userResponsibility.point4")}</li>
              <li>• {t("userResponsibility.point5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("safety.title")}</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">{t("safety.checkLegality")}</h3>
                <p className="text-blue-700 mb-2">
                  <strong>{t("safety.legalResponsibility")}</strong>
                </p>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>{t("safety.investigateItem")}</li>
                  <li>{t("safety.respectAgeLimits")}</li>
                  <li>{t("safety.checkPermissions")}</li>
                  <li>{t("safety.askIfInDoubt")}</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-2">{t("safety.reportSuspiciousActivity")}</h3>
                <p className="text-orange-700 mb-2">
                  {t("safety.helpKeepPlatformSafe")}
                </p>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  <li>{t("safety.useFlagFunction")}</li>
                  <li>{t("safety.reportIllegalPosts")}</li>
                  <li>{t("safety.contactUsForSeriousViolations")}</li>
                  <li>{t("safety.avoidSuspiciousDeals")}</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">{t("safety.foodAndBeverages")}</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li><strong>{t("safety.buySealedFood")}</strong></li>
                  <li>{t("safety.checkExpirationDates")}</li>
                  <li>{t("safety.avoidHomemadeProducts")}</li>
                  <li>{t("safety.beCarefulWithDairyAndMeat")}</li>
                  <li>{t("safety.avoidIfInDoubt")}</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">{t("safety.medicineAndHealthProducts")}</h3>
                <ul className="list-disc list-inside text-purple-700 space-y-1">
                  <li><strong>{t("safety.buySealedMedicine")}</strong></li>
                  <li>{t("safety.checkExpiryDates")}</li>
                  <li>{t("safety.prescriptionMedicineProhibition")}</li>
                  <li>{t("safety.beCarefulWithVitamins")}</li>
                  <li>{t("safety.askPharmacistIfInDoubt")}</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{t("safety.safeMeetingsAndTransactions")}</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>{t("safety.meetInPublicPlaces")}</li>
                  <li>{t("safety.bringAFriend")}</li>
                  <li>{t("safety.informSomeone")}</li>
                  <li>{t("safety.avoidPrePayment")}</li>
                  <li>{t("safety.trustYourInstincts")}</li>
                  <li>{t("safety.leaveIfSomethingFeelsOff")}</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">{t("safety.importantReminders")}</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>{t("safety.notResponsibleForUserTrades")}</li>
                  <li>{t("safety.noGuaranteeForQualityOrSafety")}</li>
                  <li>{t("safety.tradeAtYourOwnRisk")}</li>
                  <li>{t("safety.contactPoliceNotUs")}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("platformResponsibility.title")}</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>{t("platformResponsibility.important")}</strong> {t("platformResponsibility.description")}
              </p>
              <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                <li>{t("platformResponsibility.qualityGuarantee")}</li>
                <li>{t("platformResponsibility.userDisputes")}</li>
                <li>{t("platformResponsibility.uptimeGuarantee")}</li>
                <li>{t("platformResponsibility.rightToTerminate")}</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("moderation.title")}</h2>
            <p className="text-gray-700 mb-4">
              {t("moderation.weReserveTheRight")}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>{t("moderation.removePosts")}</li>
              <li>{t("moderation.suspendOrCloseAccounts")}</li>
              <li>{t("moderation.reportIllegalActivity")}</li>
              <li>{t("moderation.updateTermsWithNotice")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("personalData.title")}</h2>
            <p className="text-gray-700">
              {t("personalData.weProcessYourData")}{' '}
              <a href="/privacy" className="text-orange-500 underline">{t("personalData.privacyPolicy")}</a>.
              {t("personalData.byUsingOurService")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("contact.title")}</h2>
            <p className="text-gray-700">
              {t("contact.questionsCanBeSentTo")}
            </p>
            <ul className="text-gray-700 mt-2 space-y-1">
              <li>• Philipp Zhuravlev - philippzhuravlev@gmail.com</li>
              <li>• Christian Hyllested - crillerhylle@gmail.com</li>
            </ul>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 italic">
              {t("disclaimer.studyProject")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
