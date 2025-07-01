import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePopupContext } from '../contexts/PopupContext';
import { db } from '../firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Download, Trash2, Shield } from 'lucide-react';

const GDPRControls = ({ showDataExportOnly = false }) => {
  const { user } = useAuth();
  const { showConfirm, showSuccess, showError } = usePopupContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const exportUserData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      if (import.meta.env.DEV) {
        console.log('Starting data export for user...');
      }
      
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
        bugReports: [],
        flagReports: [],
        exportSummary: {
          itemsCount: 0,
          chatsCount: 0,
          bugReportsCount: 0,
          flagReportsCount: 0,
          errors: []
        }
      };

      // Get user's items
      try {
        if (import.meta.env.DEV) {
          console.log('Fetching user items...');
        }
        const itemsQuery = query(collection(db, 'items'), where('userId', '==', user.uid));
        const itemsSnapshot = await getDocs(itemsQuery);
        userData.items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userData.exportSummary.itemsCount = userData.items.length;
        if (import.meta.env.DEV) {
          console.log('Found user items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        userData.exportSummary.errors.push(`Failed to fetch items: ${error.message}`);
      }

      // Get user's chats - Try different path structures
      try {
        if (import.meta.env.DEV) {
          console.log('Fetching user chats...');
        }
        // First try the userChats subcollection approach
        try {
          const chatsQuery = query(collection(db, 'userChats', user.uid, 'chats'));
          const chatsSnapshot = await getDocs(chatsQuery);
          userData.chats = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          userData.exportSummary.chatsCount = userData.chats.length;
          if (import.meta.env.DEV) {
            console.log('Found chats via userChats');
          }
        } catch (subError) {
          if (import.meta.env.DEV) {
            console.log('userChats subcollection approach failed, trying main chats collection...');
          }
          // If that fails, try getting chats where user is a participant
          const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
          const chatsSnapshot = await getDocs(chatsQuery);
          userData.chats = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          userData.exportSummary.chatsCount = userData.chats.length;
          if (import.meta.env.DEV) {
            console.log('Found chats via main chats collection');
          }
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        userData.exportSummary.errors.push(`Failed to fetch chats: ${error.message}`);
      }

      // Get user's bug reports
      try {
        if (import.meta.env.DEV) {
          console.log('Fetching bug reports...');
        }
        const bugReportsQuery = query(collection(db, 'bugReports'), where('userId', '==', user.uid));
        const bugReportsSnapshot = await getDocs(bugReportsQuery);
        userData.bugReports = bugReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userData.exportSummary.bugReportsCount = userData.bugReports.length;
        if (import.meta.env.DEV) {
          console.log('Found bug reports');
        }
      } catch (error) {
        console.error('Error fetching bug reports:', error);
        userData.exportSummary.errors.push(`Failed to fetch bug reports: ${error.message}`);
      }

      // Get user's flag reports
      try {
        if (import.meta.env.DEV) {
          console.log('Fetching flag reports...');
        }
        const flagReportsQuery = query(collection(db, 'flags'), where('reporterId', '==', user.uid));
        const flagReportsSnapshot = await getDocs(flagReportsQuery);
        userData.flagReports = flagReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userData.exportSummary.flagReportsCount = userData.flagReports.length;
        if (import.meta.env.DEV) {
          console.log('Found flag reports');
        }
      } catch (error) {
        console.error('Error fetching flag reports:', error);
        userData.exportSummary.errors.push(`Failed to fetch flag reports: ${error.message}`);
      }

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

      if (import.meta.env.DEV) {
        console.log('Data export completed successfully');
      }
      const totalItems = userData.exportSummary.itemsCount + userData.exportSummary.chatsCount + 
                        userData.exportSummary.bugReportsCount + userData.exportSummary.flagReportsCount;
      
      if (userData.exportSummary.errors.length > 0) {
        showSuccess(`Data downloadet med ${totalItems} elementer. ${userData.exportSummary.errors.length} advarsler - se konsol for detaljer.`);
      } else {
        showSuccess(`Alle dine data er downloadet! (${totalItems} elementer)`);
      }
    } catch (error) {
      console.error('Critical error during data export:', error);
      showError(`Kunne ikke eksportere data: ${error.message}. Kontakt support hvis problemet fortsætter.`);
    } finally {
      setIsExporting(false);
    }
  };

  const deleteUserAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // SECURE: Use server-side function for complete GDPR-compliant deletion
      const functions = getFunctions();
      const deleteUserFunction = httpsCallable(functions, 'deleteUser');
      
      if (import.meta.env.DEV) {
        console.log('Calling server-side deleteUser function...');
      }
      
      const result = await deleteUserFunction({ 
        targetUserId: user.uid 
      });
      
      if (import.meta.env.DEV) {
        console.log('Deletion result:', result.data);
      }
      
      // Show success with deletion summary
      const { deletedItems } = result.data;
      const totalDeleted = deletedItems.items + deletedItems.bugReports + 
                          deletedItems.flags + deletedItems.chats;
      
      showSuccess(
        `Din konto er slettet. Farvel! 
        (${totalDeleted} data elementer blev slettet: 
        ${deletedItems.items} opslag, ${deletedItems.chats} beskeder, 
        ${deletedItems.bugReports} fejlrapporter, ${deletedItems.flags} anmeldelser)`
      );
      
      // User will be automatically signed out since their auth account was deleted
      
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'functions/unauthenticated') {
        showError('Du skal være logget ind for at slette din konto.');
      } else if (error.code === 'functions/permission-denied') {
        showError('Du har ikke tilladelse til at slette denne konto.');
      } else {
        showError(`Kunne ikke slette konto: ${error.message}. Kontakt support hvis problemet fortsætter.`);
      }
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
            <h3 className="font-medium text-gray-800">Download Data</h3>
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

        {/* Delete Account - Only show if not data export only */}
        {!showDataExportOnly && (
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
        )}
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