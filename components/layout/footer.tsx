import { Brain, Twitter, Linkedin, Github, Youtube } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-10">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">
                LearnSight
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm mb-4 text-balance">
              Transforming education with{" "}
              <span className="font-semibold text-primary">
                AI-driven insights
              </span>{" "}
              that{" "}
              <span className="font-medium text-foreground">
                empower students
              </span>
              ,{" "}
              <span className="font-medium text-foreground">
                support teachers
              </span>
              , and{" "}
              <span className="font-medium text-foreground">
                engage parents
              </span>
              .
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                className="text-muted-foreground hover:text-primary"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-foreground"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LearnSight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
