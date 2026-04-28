import { useEffect, useMemo, useState } from "react";
import { Link } from "https://esm.sh/react-router-dom@6.30.1";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setSEO } from "@/lib/seo";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Stethoscope,
  ListChecks,
  Combine,
  Activity,
  Library as LibraryIcon,
  Flower2,
  Pill,
  Bone,
  HeartHandshake,
  Download,
  Clock,
  type LucideIcon,
} from "lucide-react";
