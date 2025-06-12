"use client";
import ProfileCard from "@/components/ProfileCard";
import Updates from "@/components/Updates";
import Works from "@/components/Works";
import ConnectLinks from "@/components/ConnectLinks";

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3A45] to-[#3E4E5A] text-[#C7CCCF] font-serif transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#2C3A45] to-[#3E4E5A] py-4 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#C7CCCF]">法律怪人 倫獄のポートフォリオ</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 animate-fadeIn">
        <div className="grid md:grid-cols-3 gap-8">
          <ProfileCard />
          <Updates />
          <Works />
          <ConnectLinks />
        </div>
      </main>

      <footer className="bg-gradient-to-r from-[#2C3A45] to-[#3E4E5A] py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#C7CCCF]">
            &copy; 2024 倫獄. All rights reserved
            <a
              href="https://www.youtube.com/@ringowarehouse"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-[#C7CCCF] hover:text-[#CEA17A] transition-colors duration-300"
              aria-label="Hidden link"
            >
              .
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
