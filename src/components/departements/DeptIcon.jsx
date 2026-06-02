import React from 'react';
import {
  Music, Users, Heart, Star, BookOpen, Mic, Video,
  Camera, Coffee, Smile, Gift, Globe, Zap, Sun,
  Shield, Flower2, Baby, Home, Megaphone, Layers
} from 'lucide-react';

const ICONS = {
  Music, Users, Heart, Star, BookOpen, Mic, Video,
  Camera, Coffee, Smile, Gift, Globe, Zap, Sun,
  Shield, Flower2, Baby, Home, Megaphone, Layers,
};

export default function DeptIcon({ name, className }) {
  const Icon = ICONS[name] || Layers;
  return <Icon className={className} />;
}