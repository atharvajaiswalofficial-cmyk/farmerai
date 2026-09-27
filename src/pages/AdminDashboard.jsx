import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  Database,
  Server,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [docs, setDocs] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('pmfby');
  const [uploadDept, setUploadDept] = useState('Ministry of Agriculture & Farmers Welfare');
  const [uploadUrl, setUploadUrl] = useState('https://pmfby.gov.in');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [s, d, srcList] = await Promise.all([
        api.getAdminStats(),
        api.getDocuments(),
        api.getOfficialSources().catch(() => [])
      ]);
      setStats(s);
      setDocs(d || []);
      setSources(srcList || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Access Restricted: Administrator privileges required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select an official PDF file.');
      return;
    }
    setUploadError(null);
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);
      formData.append('department', uploadDept);
      formData.append('source_url', uploadUrl);

      const res = await api.uploadDocument(formData);
      setActionSuccess(`Successfully uploaded & indexed: ${uploadTitle} (${res.chunks_indexed || 0} chunks created)`);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      loadAdminData();
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReindex = async (docId, title) => {
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await api.reindexDocument(docId);
      setActionSuccess(`Re-indexed: ${title} (${res.chunks_created} chunks active in ChromaDB)`);
      loadAdminData();
    } catch (err) {
      alert(`Re-indexing failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete and un-index "${title}"?`)) return;
    setActionLoading(true);
    try {
      await api.deleteDocument(docId);
      setActionSuccess(`Document "${title}" removed from knowledge base.`);
      loadAdminData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs">Loading admin intelligence metrics & vector store stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center max-w-md mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-red-900">Admin Privileges Required</h2>
        <p className="text-xs text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Admin & Knowledge Base Control Hub</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Live ChromaDB
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage official government policy PDFs, monitor vector chunks, and view grounded RAG retrieval health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Official PDF</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Registered Beneficiaries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Grounded Inquiries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.questionsAsked || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Indexed Vector Chunks</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.vectorChunks || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Server className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Official Gov Sources</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.officialSources || 0}</p>
        </div>
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Official Policy Knowledge Documents</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">{docs.length} Documents Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Document Title</th>
                <th className="p-3">Domain Category</th>
                <th className="p-3">Department / Authority</th>
                <th className="p-3">Source URL</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-800">{d.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {d.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{d.department || d.source}</td>
                  <td className="p-3">
                    {d.source_url ? (
                      <a
                        href={d.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <span className="truncate max-w-[120px]">{d.source_url.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active RAG
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => handleReindex(d.id, d.title)}
                      title="Re-extract and Re-index Chunks"
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id, d.title)}
                      title="Delete from Vector Store"
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Government Source Registry */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-600" />
          <span>Official Government Source Registry (Priority 1 Authorities)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-800">{s.source_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  Priority {s.priority}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{s.authority}</p>
              <a
                href={`https://${s.domain}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-emerald-600 hover:underline font-mono text-[11px] flex items-center gap-1"
              >
                <span>{s.domain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Upload & Index Official PDF</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revised PMFBY Operational Guidelines 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="pmfby">PMFBY (Crop Insurance)</option>
                    <option value="pacs">PACS Services</option>
                    <option value="cooperative_laws">Cooperative Laws</option>
                    <option value="pm_kisan">PM-KISAN</option>
                    <option value="finance">Financial Literacy / KCC</option>
                    <option value="government_schemes">Government Schemes</option>
                    <option value="grievance">Grievances & CPGRAMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source URL</label>
                  <input
                    type="url"
                    placeholder="https://pmfby.gov.in"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Ministry / Department</label>
                <input
                  type="text"
                  value={uploadDept}
                  onChange={(e) => setUploadDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Official PDF File *</label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Upload & Index Chunks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
