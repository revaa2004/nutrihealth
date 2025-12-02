import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UploadReports() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) return alert("Please log in first");

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, file);

    if (uploadError) return alert("Upload failed: " + uploadError.message);

    const { data: report } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_name: file.name,
      })
      .select()
      .single();

    const textContent = await file.text();

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ report_id: report.id, file_text: textContent }),
      }
    );

    const result = await res.json();
    setAnalysis(result.aiText);
  };

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Upload Medical Report</h1>

      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Upload & Analyze
      </button>

      {analysis && (
        <div className="mt-6 p-4 border rounded bg-white">
          <h2 className="font-bold text-xl mb-2">AI Nutrition Insights</h2>
          <pre className="whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
    </div>
  );
}
