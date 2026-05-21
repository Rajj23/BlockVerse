import Link from "next/link";
import { FileX } from "lucide-react";

export default function DocumentNotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
          <FileX className="w-6 h-6 text-neutral-400" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
          Document not found
        </h2>
        <p className="text-sm text-neutral-400 mb-4">
          This document may have been deleted or you don&apos;t have access.
        </p>
        <Link
          href="/home"
          className="text-sm text-neutral-900 dark:text-white underline hover:no-underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}