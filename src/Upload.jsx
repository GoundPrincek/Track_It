import { useMemo, useRef, useState } from "react";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { API_BASE } from "./config/api";

const Upload = () => {
  const csvInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const [csvFile, setCsvFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [csvError, setCsvError] = useState("");
  const [pdfError, setPdfError] = useState("");

  const [csvResult, setCsvResult] = useState(null);
  const [pdfResult, setPdfResult] = useState(null);

  const token = localStorage.getItem("token");

  const tableHeaders = useMemo(() => {
    if (!csvResult?.headers?.length) return [];
    return csvResult.headers;
  }, [csvResult]);

  const handleCsvSelect = (event) => {
    const file = event.target.files?.[0];
    setCsvError("");
    setCsvResult(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please select a valid CSV file.");
      setCsvFile(null);
      return;
    }

    setCsvFile(file);
  };

  const handlePdfSelect = (event) => {
    const file = event.target.files?.[0];
    setPdfError("");
    setPdfResult(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please select a valid PDF file.");
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
  };

  const uploadCsv = async () => {
    if (!csvFile) {
      setCsvError("Please choose a CSV file first.");
      return;
    }

    try {
      setCsvLoading(true);
      setCsvError("");
      setCsvResult(null);

      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch(`${API_BASE}/upload/csv`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload CSV.");
      }

      setCsvResult(data);
    } catch (error) {
      setCsvError(error.message || "Something went wrong while uploading CSV.");
    } finally {
      setCsvLoading(false);
    }
  };

  const uploadPdf = async () => {
    if (!pdfFile) {
      setPdfError("Please choose a PDF file first.");
      return;
    }

    try {
      setPdfLoading(true);
      setPdfError("");
      setPdfResult(null);

      const formData = new FormData();
      formData.append("file", pdfFile);

      const response = await fetch(`${API_BASE}/upload/pdf`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload PDF.");
      }

      setPdfResult(data);
    } catch (error) {
      setPdfError(error.message || "Something went wrong while uploading PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const resetCsv = () => {
    setCsvFile(null);
    setCsvError("");
    setCsvResult(null);
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const resetPdf = () => {
    setPdfFile(null);
    setPdfError("");
    setPdfResult(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e5e7eb]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-[#2a2f3a] bg-[#161b22] p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-[#2a2f3a] bg-[#11161d] p-3">
              <UploadIcon className="h-6 w-6 text-[#60a5fa]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Upload Center
              </h1>
              <p className="mt-1 text-sm text-[#9ca3af]">
                Read CSV files into structured rows and extract readable text from PDFs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2f3a] bg-[#161b22] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-[#2a2f3a] bg-[#11161d] p-2.5">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">CSV Upload</h2>
                <p className="text-sm text-[#9ca3af]">
                  Upload and preview structured CSV rows.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-[#374151] bg-[#11161d] p-4">
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvSelect}
                className="hidden"
              />

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-[#cbd5e1]">
                  <FileUp className="h-4 w-4" />
                  <span>{csvFile ? csvFile.name : "Choose a CSV file"}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => csvInputRef.current?.click()}
                    className="rounded-xl border border-[#334155] bg-[#1f2937] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#273244]"
                  >
                    Select CSV
                  </button>

                  <button
                    type="button"
                    onClick={uploadCsv}
                    disabled={csvLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {csvLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4" />
                        Upload CSV
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetCsv}
                    className="rounded-xl border border-[#334155] px-4 py-2 text-sm font-medium text-[#cbd5e1] transition hover:bg-[#1f2937]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {csvError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {csvResult?.success && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {csvResult.message} Parsed <strong>{csvResult.rowCount}</strong> rows.
                </span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#2a2f3a] bg-[#161b22] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl border border-[#2a2f3a] bg-[#11161d] p-2.5">
                <FileText className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">PDF Upload</h2>
                <p className="text-sm text-[#9ca3af]">
                  Upload and extract readable PDF text.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-[#374151] bg-[#11161d] p-4">
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfSelect}
                className="hidden"
              />

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-[#cbd5e1]">
                  <FileUp className="h-4 w-4" />
                  <span>{pdfFile ? pdfFile.name : "Choose a PDF file"}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="rounded-xl border border-[#334155] bg-[#1f2937] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#273244]"
                  >
                    Select PDF
                  </button>

                  <button
                    type="button"
                    onClick={uploadPdf}
                    disabled={pdfLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pdfLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4" />
                        Upload PDF
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetPdf}
                    className="rounded-xl border border-[#334155] px-4 py-2 text-sm font-medium text-[#cbd5e1] transition hover:bg-[#1f2937]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {pdfError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{pdfError}</span>
              </div>
            )}

            {pdfResult?.success && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {pdfResult.message} Found <strong>{pdfResult.pageCount}</strong> pages.
                </span>
              </div>
            )}
          </div>
        </div>

        {csvResult?.success && (
          <div className="mt-6 rounded-2xl border border-[#2a2f3a] bg-[#161b22] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">CSV Preview</h3>
                <p className="text-sm text-[#9ca3af]">
                  Showing up to 20 rows from the uploaded CSV file.
                </p>
              </div>
              <div className="rounded-xl border border-[#2a2f3a] bg-[#11161d] px-3 py-2 text-sm text-[#cbd5e1]">
                {csvResult.rowCount} rows
              </div>
            </div>

            {csvResult.previewRows?.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-[#2a2f3a]">
                <table className="min-w-full divide-y divide-[#2a2f3a]">
                  <thead className="bg-[#11161d]">
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#94a3b8]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#2a2f3a] bg-[#161b22]">
                    {csvResult.previewRows.map((row, index) => (
                      <tr key={index} className="hover:bg-[#11161d]">
                        {tableHeaders.map((header) => (
                          <td
                            key={`${index}-${header}`}
                            className="px-4 py-3 text-sm text-[#e5e7eb]"
                          >
                            {row[header] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-[#2a2f3a] bg-[#11161d] p-4 text-sm text-[#9ca3af]">
                No rows found in this CSV.
              </div>
            )}
          </div>
        )}

        {pdfResult?.success && (
          <div className="mt-6 rounded-2xl border border-[#2a2f3a] bg-[#161b22] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">PDF Text Preview</h3>
                <p className="text-sm text-[#9ca3af]">
                  Extracted text preview from the uploaded PDF.
                </p>
              </div>
              <div className="rounded-xl border border-[#2a2f3a] bg-[#11161d] px-3 py-2 text-sm text-[#cbd5e1]">
                {pdfResult.pageCount} pages
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2f3a] bg-[#11161d] p-4">
              <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-[#d1d5db]">
                {pdfResult.previewText || "No readable text could be extracted from this PDF."}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;