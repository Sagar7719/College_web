import {
  GraduationCap, Megaphone, Building2, FileText, ArrowRight, Users, Microscope,
  Rocket, BookOpen, Award, FlaskConical, Briefcase, Sparkles, Landmark, Bell,
  Download, FileCheck, FolderDown, BellOff, Mail, Quote, CheckCircle2, Scroll,
  MapPin, PhoneCall, Map, Compass, Pin, Calendar, Camera, ArrowUpRight,
  Target, UserCheck, ShieldCheck, Clock, HelpCircle, HeartHandshake,
  Globe, Share2, ExternalLink, AlertTriangle, ChevronDown, Filter,
  Search, AlertCircle, Tag, BellRing, ChevronRight, Info,
} from 'lucide-react';
import React from 'react';

// Map of icon name strings to their Lucide React components
const ICON_MAP: Record<string, React.FC<{ size?: number; strokeWidth?: number; className?: string }>> = {
  GraduationCap, Megaphone, Building2, FileText, ArrowRight, Users, Microscope,
  Rocket, BookOpen, Award, FlaskConical, Briefcase, Sparkles, Landmark, Bell,
  Download, FileCheck, FolderDown, BellOff, Mail, Quote, CheckCircle2, Scroll,
  MapPin, PhoneCall, Map, Compass, Pin, Calendar, Camera, ArrowUpRight,
  Target, UserCheck, ShieldCheck, Clock, HelpCircle, HeartHandshake,
  Globe, Share2, ExternalLink, AlertTriangle, ChevronDown, Filter,
  Search, AlertCircle, Tag, BellRing, ChevronRight, Info,
};

/**
 * Resolves an icon key string (e.g. 'GraduationCap') to a React element.
 * Returns null if the icon key is not found in the registry.
 */
export function resolveIcon(
  iconKey: string | undefined,
  size: number = 24,
  strokeWidth: number = 1.8,
  className?: string,
): React.ReactNode {
  if (!iconKey) return null;
  const IconComponent = ICON_MAP[iconKey];
  if (!IconComponent) return null;
  return React.createElement(IconComponent, { size, strokeWidth, className });
}

export { ICON_MAP };
