import React from 'react';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation("privacy");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">{t('title')}</h1>
        <p className="text-sm text-gray-600 mb-8">{t('lastUpdated', { date: new Date().toLocaleDateString('da-DK') })}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dataController.title')}</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold">{t('dataController.description')}</p>
              <p className="text-blue-700">
                {t('dataController.contacts.0')}<br />
                {t('dataController.contacts.1')}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dataCollection.title')}</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-800">{t('dataCollection.collectedData.title')}</h3>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  {t('dataCollection.collectedData.items', { returnObjects: true }).map((item, index) => (
                    <li key={index}>
                      <strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-800">{t('dataCollection.notCollectedData.title')}</h3>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                  {t('dataCollection.notCollectedData.items', { returnObjects: true }).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dataUsage.title')}</h2>
            <div className="space-y-3">
              {t('dataUsage.reasons', { returnObjects: true }).map((reason, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <strong>{reason.title}</strong>
                  <p className="text-gray-700 text-sm mt-1">{reason.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dataSharing.title')}</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {t('dataSharing.description', { returnObjects: true }).map((desc, index) => (
                <p key={index} className={`text-yellow-${index === 0 ? '800 font-semibold mb-2' : '700 text-sm'}`}>
                  {desc}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('gdprRights.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {t('gdprRights.rights', { returnObjects: true }).map((right, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-orange-500 mb-2">{right.title}</h3>
                  <p className="text-sm text-gray-700">{right.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">{t('gdprRights.exerciseRights.title')}</p>
              <p className="text-green-700 text-sm mt-1">{t('gdprRights.exerciseRights.description')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dataSecurity.title')}</h2>
            <ul className="space-y-2 text-gray-700">
              {t('dataSecurity.measures', { returnObjects: true }).map((measure, index) => (
                <li key={index}>• {measure}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dataRetention.title')}</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                {t('dataRetention.retentionRules', { returnObjects: true }).map((rule, index) => (
                  <li key={index}>
                    <strong>{rule.split(':')[0]}:</strong> {rule.split(':')[1]}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('childrenPrivacy.title')}</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              {t('childrenPrivacy.description', { returnObjects: true }).map((desc, index) => (
                <p key={index} className={`text-red-${index === 0 ? '800 font-semibold' : '700 text-sm mt-1'}`}>
                  {desc}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('policyChanges.title')}</h2>
            <p className="text-gray-700">{t('policyChanges.description')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('contactAndComplaints.title')}</h2>
            <div className="space-y-4">
              <div>
                <strong>{t('contactAndComplaints.questions.title')}</strong>
                <ul className="text-gray-700 mt-1 space-y-1">
                  {t('contactAndComplaints.questions.contacts', { returnObjects: true }).map((contact, index) => (
                    <li key={index}>• {contact}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>{t('contactAndComplaints.complaints.title')}</strong>
                <p className="text-gray-700 text-sm">
                  {t('contactAndComplaints.complaints.description')}<br />
                  <a href={t('contactAndComplaints.complaints.link')} className="text-orange-500 underline">
                    {t('contactAndComplaints.complaints.link')}
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="border-t pt-6">
            <p className="text-sm text-gray-600 italic">{t('disclaimer.description')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;