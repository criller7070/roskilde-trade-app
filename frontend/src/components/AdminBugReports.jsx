import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAdmin } from "../contexts/AdminContext";
import { usePopupContext } from "../contexts/PopupContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Trash2, AlertTriangle, Eye, CheckCircle } from "lucide-react";
import LoadingPlaceholder from "./LoadingPlaceholder";

const AdminBugReports = () => {
  const { user } = useAuth();
  const { showError, showSuccess, showConfirm } = usePopupContext();
  const { 
    isAdmin, 
    adminLoading, 
    logAdminAction
  } = useAdmin();
  
  const [bugReports, setBugReports] = useState([]);
  const [bugReportsLoading, setBugReportsLoading] = useState(true);

  // Subscribe to bug reports
  useEffect(() => {
    // Don't start listener if admin status is still loading or user is not admin
    if (adminLoading || !user || !isAdmin) return;

    const q = query(collection(db, "bugReports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setBugReports(reportsData);
      setBugReportsLoading(false);
    }, (error) => {
      console.error("Error fetching bug reports:", error);
      setBugReportsLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, adminLoading, user]);

  const handleUpdateBugReportStatus = async (reportId, newStatus) => {
    try {
      await updateDoc(doc(db, "bugReports", reportId), {
        status: newStatus
      });
      await logAdminAction('update_bug_report_status', {
        reportId,
        newStatus,
        updatedAt: new Date()
      });
      showSuccess(`Fejlrapport markeret som ${newStatus}!`);
    } catch (error) {
      console.error("Error updating bug report status:", error);
      showError("Kunne ikke opdatere fejlrapport.");
    }
  };

  const handleDeleteBugReport = async (reportId, reportDescription) => {
    showConfirm(
      `Er du sikker på at du vil slette denne fejlrapport? Denne handling kan ikke fortrydes.\n\n"${reportDescription.substring(0, 100)}${reportDescription.length > 100 ? '...' : ''}"`,
      async () => {
        try {
          await deleteDoc(doc(db, "bugReports", reportId));
          await logAdminAction('delete_bug_report', {
            reportId,
            deletedAt: new Date()
          });
          showSuccess("Fejlrapport slettet!");
        } catch (error) {
          console.error("Error deleting bug report:", error);
          showError("Kunne ikke slette fejlrapport. Prøv igen.");
        }
      },
      "Bekræft Sletning",
      "Slet",
      "Annuller"
    );
  };

  if (adminLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Indlæser administratorpanel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Adgang Nægtet</h2>
          <p className="text-gray-600">Log venligst ind for at få adgang til administratorpanelet.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Adgang Nægtet</h2>
          <p className="text-gray-600">Du har ikke tilladelse til at få adgang til administratorpanelet.</p>
          <p className="text-sm text-gray-500 mt-2">Kontakt en administrator, hvis du mener, dette er en fejl.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Fejlrapporter</h1>
        <p className="text-gray-600">Gennemgå og administrer brugerrapporterede problemer</p>
      </div>

      {/* Bug Reports Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Alle Fejlrapporter</h2>
          <p className="text-sm text-gray-600 mt-1">Administrer indberettede fejl og problemer</p>
        </div>
        
        <div className="p-6">
          {bugReportsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Indlæser fejlrapporter...</p>
            </div>
          ) : bugReports.length > 0 ? (
            <div className="space-y-4">
              {bugReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 lg:mr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          report.status === 'open' 
                            ? 'bg-red-100 text-red-800' 
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'open' ? 'åben' : report.status === 'resolved' ? 'løst' : report.status || 'åben'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {report.createdAt?.toDate?.()?.toLocaleDateString('da-DK') || 'Ukendt dato'}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-3 break-words">{report.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
                        {report.imageUrl && (
                          <LoadingPlaceholder 
                            src={report.imageUrl} 
                            alt="Bug screenshot" 
                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition flex-shrink-0"
                            placeholderClassName="rounded border"
                          >
                            <div 
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => window.open(report.imageUrl, '_blank')}
                              title="Klik for at se i fuld størrelse"
                            />
                          </LoadingPlaceholder>
                        )}
                        
                        <div className="text-xs text-gray-500 space-y-1 flex-1 min-w-0">
                          <p className="break-words"><strong>Bruger:</strong> {report.userName} ({report.userEmail})</p>
                          <p className="break-words"><strong>Browser:</strong> {report.userAgent?.split(' ').slice(-2).join(' ') || 'Ukendt'}</p>
                          <p className="break-words"><strong>URL:</strong> {report.url || 'Ukendt'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row lg:flex-col gap-2 lg:space-y-2 lg:flex-shrink-0">
                      {report.status === 'open' && (
                        <button
                          onClick={() => handleUpdateBugReportStatus(report.id, 'resolved')}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition flex-1 lg:flex-none whitespace-nowrap"
                        >
                          <CheckCircle size={12} />
                          <span className="hidden sm:inline">Markér som Løst</span>
                          <span className="sm:hidden">Løs</span>
                        </button>
                      )}
                      
                      {report.status === 'resolved' && (
                        <button
                          onClick={() => handleUpdateBugReportStatus(report.id, 'open')}
                          className="flex items-center justify-center space-x-1 px-3 py-2 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition flex-1 lg:flex-none whitespace-nowrap"
                        >
                          <Eye size={12} />
                          <span>Genåbn</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteBugReport(report.id, report.description)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex-1 lg:flex-none whitespace-nowrap"
                      >
                        <Trash2 size={12} />
                        <span>Slet</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">Ingen fejlrapporter endnu.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBugReports; 