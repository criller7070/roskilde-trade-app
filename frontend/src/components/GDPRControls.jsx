import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePopupContext } from '../contexts/PopupContext';
import { db } from '../firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Download, Trash2, Shield } from 'lucide-react';

const GDPRControls = () => {
  const { user } = useAuth();
  const { showConfirm, showSuccess, showError } = usePopupContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const exportUserData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Collect all user data
      const userData = {
        account: {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          exportedAt: new Date().toISOString()
        },
        items: [],
        chats: [],
        bugReports: []
      };

      // Get user's items
      const itemsQuery = query(collection(db, 'items'), where('userId', '==', user.uid));
      const itemsSnapshot = await getDocs(itemsQuery);
      userData.items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get user's chats
      const chatsQuery = query(collection(db, `userChats/${user.uid}/chats`));
      const chatsSnapshot = await getDocs(chatsQuery);
      userData.chats = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get user's bug reports
      const bugReportsQuery = query(collection(db, 'bugReports'), where('userId', '==', user.uid));
      const bugReportsSnapshot = await getDocs(bugReportsQuery);
      userData.bugReports = bugReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Download as JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rosswap-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Dine data er downloadet!');
    } catch (error) {
      console.error('Error exporting data:', error);
      showError('Kunne ikke eksportere data. Prøv igen.');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteUserAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Note: This is a simplified deletion - in production you'd want server-side functions
      // to handle cascade deletion properly
      
      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete user's items
      const itemsQuery = query(collection(db, 'items'), where('userId', '==', user.uid));
      const itemsSnapshot = await getDocs(itemsQuery);
      for (const itemDoc of itemsSnapshot.docs) {
        await deleteDoc(itemDoc.ref);
      }

      // Delete user's chat subcollection
      const chatsQuery = query(collection(db, `userChats/${user.uid}/chats`));
      const chatsSnapshot = await getDocs(chatsQuery);
      for (const chatDoc of chatsSnapshot.docs) {
        await deleteDoc(chatDoc.ref);
      }

      // Sign out user
      await user.delete(); // This will delete the Firebase Auth account
      
      showSuccess('Din konto er slettet. Farvel!');
    } catch (error) {
      console.error('Error deleting account:', error);
      showError('Kunne ikke slette konto. Kontakt support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteAccount = () => {
    showConfirm(
      'Er du helt sikker på at du vil slette din konto? Denne handling kan IKKE fortrydes. Alle dine opslag, beskeder og data vil blive permanent slettet.',
      deleteUserAccount,
      'Slet Min Konto',
      'JA, SLET PERMANENT',
      'Annuller'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Shield className="w-5 h-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Dine GDPR-Rettigheder</h2>
      </div>
      
      <p className="text-gray-600 text-sm mb-6">
        I henhold til GDPR har du ret til at få udleveret dine data og til at få slettet din konto.
      </p>

      <div className="space-y-4">
        {/* Export Data */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">Download Mine Data</h3>
            <p className="text-sm text-gray-600">
              Få en komplet kopi af alle data vi har om dig i JSON-format.
            </p>
          </div>
          <button
            onClick={exportUserData}
            disabled={isExporting}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Eksporterer...' : 'Download'}
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Slet Min Konto</h3>
            <p className="text-sm text-red-600">
              Permanent sletning af din konto og alle tilknyttede data. Denne handling kan ikke fortrydes.
            </p>
          </div>
          <button
            onClick={confirmDeleteAccount}
            disabled={isDeleting}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Sletter...' : 'Slet Konto'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Bemærk:</strong> Hvis du har spørgsmål om dine data eller ønsker hjælp med dine rettigheder, 
          kan du kontakte os på philippzhuravlev@gmail.com. Du kan også læse mere i vores{' '}
          <a href="/privacy" className="text-orange-500 underline">privatlivspolitik</a>.
        </p>
      </div>
    </div>
  );
};

export default GDPRControls; 