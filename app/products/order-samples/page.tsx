import { getAllSamples, getSampleSettings } from "@/lib/database/actions/sample.actions";
import SamplePackClient from "../../../components/shared/product/SamplePackClient";

export default async function OrderSamplesPage() {
  const [samples, settings] = await Promise.all([
    getAllSamples(),
    getSampleSettings()
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SamplePackClient samples={samples || []} settings={settings} />
    </div>
  );
}
