"use server";

import { connectToDatabase } from "../connect";
import Sample from "../models/sample.model";
import SampleSettings from "../models/sample-settings.model";

export async function getAllSamples() {
  try {
    await connectToDatabase();
    const samples = await Sample.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(samples));
  } catch (error) {
    console.log(error);
  }
}

export async function getSamplesByIds(ids: string[]) {
  try {
    await connectToDatabase();
    const samples = await Sample.find({ _id: { $in: ids } }).lean();
    return JSON.parse(JSON.stringify(samples));
  } catch (error) {
    console.log(error);
  }
}

export async function getSampleSettings() {
  try {
    await connectToDatabase();
    const settings = await SampleSettings.findOne({}).sort({ createdAt: 1 }).lean();
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getSampleByProductId(productId: string) {
  try {
    await connectToDatabase();
    const sample = await Sample.findOne({ productId: productId }).lean();
    return sample ? JSON.parse(JSON.stringify(sample)) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getSamplesByProductId(productId: string) {
  try {
    await connectToDatabase();
    const samples = await Sample.find({ productId: productId }).lean();
    return JSON.parse(JSON.stringify(samples));
  } catch (error) {
    console.log(error);
    return [];
  }
}
