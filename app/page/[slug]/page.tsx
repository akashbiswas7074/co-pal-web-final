import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomPageBySlug, getAllActiveCustomPageSlugs } from "@/lib/database/actions/custom-pages.actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Enable Static Site Generation for better performance
export async function generateStaticParams() {
  const slugs = await getAllActiveCustomPageSlugs();
  return slugs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await getCustomPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    // Open Graph / Twitter could be added here
  };
}

export default async function CustomPageContent({ params }: PageProps) {
  const { slug } = await params;
  const { success, page } = await getCustomPageBySlug(slug);

  if (!success || !page) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header Section */}
      <section className="bg-gray-50 py-16 md:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center md:text-left">
            {page.title}
          </h1>
          <div className="h-1.5 w-20 bg-blue-600 mt-6 rounded-full mx-auto md:mx-0" />
        </div>
      </section>

      {/* Main Content Area */}
      <article className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div 
          className="prose prose-lg md:prose-xl prose-slate max-w-none 
          prose-headings:text-gray-900 prose-headings:font-bold 
          prose-p:text-gray-600 prose-p:leading-relaxed 
          prose-li:text-gray-600 prose-strong:text-gray-900 
          prose-img:rounded-2xl prose-img:shadow-lg
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>

      {/* Optional Footer/CTA Section */}
      <section className="bg-gray-50/50 py-12 border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            Last updated: {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </section>
    </div>
  );
}
