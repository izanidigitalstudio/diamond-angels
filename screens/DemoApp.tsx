import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ScrollView, StatusBar, Dimensions, Modal, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const C = {
  bg: '#0A0A0F', card: '#141420', cardLight: '#1E1E2E',
  gold: '#C9A84C', goldLight: '#E0C872',
  text: '#FFFFFF', sub: '#9CA3AF', muted: '#6B7280',
  border: '#2D2D3D', green: '#10B981', red: '#EF4444',
  warn: '#F59E0B', black: '#111118',
};

const { width } = Dimensions.get('window');
const IMG = 'https://api.a0.dev/assets/image';
const tImg = (d: string, s: number) => `${IMG}?text=${encodeURIComponent(d)}&aspect=3:4&seed=${s}`;
const t5 = (d: string, s: number) => [
  tImg(d + ' portrait', s),
  tImg(d + ' full body', s + 1),
  tImg(d + ' lifestyle', s + 2),
  tImg(d + ' evening look', s + 3),
  tImg(d + ' candid smile', s + 4),
];

const SLIDE_W = width - 40;

function PhotoSlider({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  const valid = photos.filter(Boolean);
  if (valid.length === 0) {
    return (
      <View style={{ width: SLIDE_W, height: SLIDE_W * 1.2, borderRadius: 14, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person" size={48} color={C.muted} />
      </View>
    );
  }
  return (
    <View>
      <ScrollView
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={(e: any) => setIdx(Math.round(e.nativeEvent.contentOffset.x / SLIDE_W))}
        scrollEventThrottle={16}
      >
        {valid.map((url: string, i: number) => (
          <Image key={i} source={{ uri: url }} style={{ width: SLIDE_W, height: SLIDE_W * 1.2, borderRadius: 14 }} />
        ))}
      </ScrollView>
      {valid.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {valid.map((_: string, i: number) => (
            <View key={i} style={{ width: idx === i ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: idx === i ? C.gold : C.border }} />
          ))}
        </View>
      )}
      <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>{idx + 1} / {valid.length}</Text>
    </View>
  );
}

const TALENT = [
  // JOHANNESBURG (13 talents)
  {
    id: '1', firstName: 'Naledi', lastName: 'Mokoena', city: 'Johannesburg', area: 'Sandton', race: 'Black', bodyType: 'Slim', heightCm: 172, categories: ['Model','Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('professional african female model elegant studio',101),
    background: 'Fashion model and content creator from Sandton, Johannesburg with a passion for luxury brands and high-end events.',
    qualifications: 'Diploma in Fashion & Marketing | Professional Modelling Certification | Brand Representation Training',
    skills: ['Professional photography', 'Runway modelling', 'Social media management', 'Event coordination', 'Brand ambassador work', 'Fluent English, Zulu'],
    hobbies: ['Yoga', 'Photography', 'Travel blogging', 'Fashion design', 'Charity work'],
    talents: ['High fashion runway', 'Commercial modelling', 'Brand ambassador', 'Event hosting', 'Product demonstration', 'Content creation'],
    workExperience: '6+ years in fashion industry. Worked with Woolworths, Edgars, Takealot, Clicks on major campaigns. Featured in Cosmo SA, Elle SA. SAFW 2022, 2023.',
    availability: 'Available most days. Flexible hours with 48 hours notice. Rates negotiable for multi-day contracts.'
  },
  {
    id: '2', firstName: 'Thandi', lastName: 'Mabaso', city: 'Johannesburg', area: 'Rosebank', race: 'Black', bodyType: 'Athletic', heightCm: 175, categories: ['Model','Brand Ambassador'], status: 'approved',
    photos: t5('tall athletic african female model editorial',201),
    background: 'Tall athletic model based in Rosebank. Known for commanding presence on runways and in commercial shoots.',
    qualifications: 'International Modelling Agency Certified | BA Business Administration | Sports Marketing Diploma',
    skills: ['Runway modelling', 'Editorial photography', 'Brand representation', 'Sports marketing', 'Public speaking', 'Zulu, English, Sotho'],
    hobbies: ['Fitness training', 'Adventure travel', 'Photography', 'Mentoring younger models'],
    talents: ['High fashion shows', 'Sports brand campaigns', 'Commercial ads', 'Brand activations', 'Event hosting'],
    workExperience: '8+ years international and local modelling. Paris Fashion Week, Lagos Fashion Week. Nike, Adidas, Puma campaigns. 45k+ social followers.',
    availability: 'Available for premium bookings with 2 weeks notice. Flexible for significant contracts. Can travel nationally.'
  },
  {
    id: '3', firstName: 'Lerato', lastName: 'Khumalo', city: 'Johannesburg', area: 'Fourways', race: 'Black', bodyType: 'Curvy', heightCm: 168, categories: ['Hostess','Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('curvy african female hostess elegant black dress',301),
    background: 'Enthusiastic promoter and hostess from Fourways. Infectious energy and genuine connection with brands.',
    qualifications: 'Event Management Certificate | Brand Promotion Training | Customer Service Excellence',
    skills: ['Crowd engagement', 'Event hosting', 'Product promotion', 'Sampling', 'Entertainment', 'Zulu, English, Sotho', 'Dance & choreography'],
    hobbies: ['Dance performances', 'Community events', 'Music festivals', 'Entrepreneurship'],
    talents: ['Festival promotion', 'Product launches', 'Brand activations', 'Crowd entertainment', 'Event hosting'],
    workExperience: '5+ years event promotion. Samsung, MTN, Coca-Cola campaigns. Oppikoppi, Rocking the Daisies. Exceeds sampling targets consistently.',
    availability: 'Available weekends and evening events. Flexible weekdays. 48 hours notice. Rates negotiable for corporate.'
  },
  {
    id: '4', firstName: 'Bianca', lastName: 'Ferreira', city: 'Johannesburg', area: 'Melrose', race: 'White', bodyType: 'Slim', heightCm: 176, categories: ['Model','Hostess'], status: 'approved',
    photos: t5('blonde south african female model elegant',401),
    background: 'Sophisticated model and luxury hostess with refined aesthetic. Perfect for high-end brand activations.',
    qualifications: 'Modelling School Certification | Hospitality Management | Event Coordination Diploma',
    skills: ['Fashion modelling', 'Luxury event hosting', 'Brand representation', 'Runway work', 'Photography', 'Event coordination', 'English, Afrikaans'],
    hobbies: ['Wine tasting', 'Fine dining', 'Art collection', 'Travel'],
    talents: ['Fashion shows', 'Luxury brand events', 'Commercial campaigns', 'Corporate galas', 'Brand ambassador'],
    workExperience: '7+ years modelling and luxury hostessing. South African Fashion Week. Cartier, Louis Vuitton, luxury hotels. Premium brand experience.',
    availability: 'Available premium events. 1-2 weeks notice preferred. Flexible for quality clients.'
  },
  {
    id: '5', firstName: 'Mpho', lastName: 'Sithole', city: 'Johannesburg', area: 'Braamfontein', race: 'Black', bodyType: 'Slim', heightCm: 170, categories: ['Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('young african female promoter energetic vibrant',501),
    background: 'Young and vibrant promoter from Braamfontein. Brings energy and authenticity to brand activations.',
    qualifications: 'Marketing & Communications Diploma | Brand Promotion Certification',
    skills: ['Crowd engagement', 'Social media fluency', 'Event hosting', 'Brand storytelling', 'Content creation', 'Xhosa, English'],
    hobbies: ['Social media', 'Music festivals', 'Community service', 'Fitness'],
    talents: ['Brand activations', 'Community events', 'Social media ambassadorships', 'Festival hosting'],
    workExperience: '3+ years brand promotion. Worked with MTN, Vodacom community projects. 25k+ social followers.',
    availability: 'Available most weekends and flexible weekdays. 48 hours notice. Growth-oriented.'
  },
  {
    id: '6', firstName: 'Zanele', lastName: 'Ngcobo', city: 'Johannesburg', area: 'Midrand', race: 'Black', bodyType: 'Athletic', heightCm: 174, categories: ['Model','Promoter','Bottle Girl'], status: 'approved',
    photos: t5('athletic african female model stylish urban',601),
    background: 'Athletic model from Midrand. Strong portfolio in both editorial and commercial work with urban aesthetic.',
    qualifications: 'Fashion Photography Course | Model Training Certification',
    skills: ['Commercial modelling', 'Urban fashion shoots', 'Product demonstration', 'Brand representation', 'Zulu, English'],
    hobbies: ['Photography', 'Street style', 'Fitness', 'Music'],
    talents: ['Commercial campaigns', 'Urban fashion shoots', 'Brand events', 'Festival work'],
    workExperience: '4+ years modelling. Commercial brands and fashion editorials. Urban fashion expertise.',
    availability: 'Available weekends and some weekday evenings. 48 hours notice.'
  },
  {
    id: '7', firstName: 'Megan', lastName: 'Botha', city: 'Johannesburg', area: 'Bedfordview', race: 'White', bodyType: 'Athletic', heightCm: 169, categories: ['Hostess','Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('athletic brunette south african female model',701),
    background: 'Professional hostess and promoter from Bedfordview. Reliable and energetic for corporate and consumer events.',
    qualifications: 'Event Management Diploma | Brand Activation Training',
    skills: ['Event hosting', 'Crowd engagement', 'Product promotion', 'Corporate relations', 'Afrikaans, English'],
    hobbies: ['Event planning', 'Fitness', 'Networking'],
    talents: ['Corporate events', 'Brand activations', 'Product launches', 'Event hosting'],
    workExperience: '4+ years hostessing and promotion. Corporate events and brand activations.',
    availability: 'Available most evenings and weekends. Notice: 1 week preferred.'
  },
  {
    id: '8', firstName: 'Palesa', lastName: 'Molefe', city: 'Johannesburg', area: 'Soweto', race: 'Black', bodyType: 'Petite', heightCm: 160, categories: ['Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('petite african female brand ambassador vibrant',801),
    background: 'Petite promoter from Soweto with vibrant personality. Excellent for community-focused campaigns.',
    qualifications: 'Community Marketing Certification | Brand Activation Training',
    skills: ['Community engagement', 'Bilingual (English, Sotho)', 'Crowd engagement', 'Event hosting', 'Dance'],
    hobbies: ['Community events', 'Dance', 'Music festivals'],
    talents: ['Community activations', 'Event promotion', 'Brand ambassador work'],
    workExperience: '3+ years community promotion. Local and national brands.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice.'
  },
  {
    id: '9', firstName: 'Refilwe', lastName: 'Mashigo', city: 'Johannesburg', area: 'Centurion', race: 'Black', bodyType: 'Slim', heightCm: 178, categories: ['Model','Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('striking tall african female model red hair editorial', 901),
    background: 'Striking redhead model from Parkhurst. Distinctive look perfect for commercial and editorial work.',
    qualifications: 'Modelling Certification | Hospitality Training',
    skills: ['Commercial modelling', 'Editorial work', 'Event hosting', 'Brand representation', 'English, Afrikaans'],
    hobbies: ['Fashion', 'Travel', 'Art'],
    talents: ['Commercial campaigns', 'Event hosting', 'Brand ambassador'],
    workExperience: '4+ years modelling. Various commercial brands and events.',
    availability: 'Available with reasonable notice. Based in Johannesburg.'
  },
  {
    id: '10', firstName: 'Kagiso', lastName: 'Mthembu', city: 'Johannesburg', area: 'Lenasia', race: 'Indian', bodyType: 'Slim', heightCm: 165, categories: ['Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('indian female promoter energetic vibrant', 1301),
    background: 'Energetic promoter from Lenasia. Bilingual skills and community connection.',
    qualifications: 'Marketing Diploma | Community Engagement Certification',
    skills: ['Community engagement', 'Bilingual (English, Hindi)', 'Social media', 'Event hosting', 'Dance (Bollywood, contemporary)'],
    hobbies: ['Bollywood dancing', 'Social media', 'Community service'],
    talents: ['Community activations', 'Cultural events', 'Brand promotions'],
    workExperience: '3+ years community promotion. Local and national brands.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice.'
  },

  // CAPE TOWN (11 talents)
  {
    id: '14', firstName: 'Chantelle', lastName: 'van Wyk', city: 'Cape Town', area: 'Sea Point', race: 'White', bodyType: 'Athletic', heightCm: 168, categories: ['Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('blonde female model athletic cape town',1401),
    background: 'Athletic promoter from Sea Point. Experienced with luxury beach and resort brands.',
    qualifications: 'Brand Promotion Certification | Event Management Training',
    skills: ['Brand promotion', 'Event hosting', 'Crowd engagement', 'Afrikaans, English'],
    hobbies: ['Beach sports', 'Fitness', 'Networking'],
    talents: ['Brand activations', 'Event promotion', 'Beach events'],
    workExperience: '4+ years promotion. Cape Town based brands and events.',
    availability: 'Available most weekends and flexible weekdays. Based Cape Town.'
  },
  {
    id: '15', firstName: 'Kayla', lastName: 'September', city: 'Cape Town', area: 'Stellenbosch', race: 'Coloured', bodyType: 'Slim', heightCm: 169, categories: ['Model','Promoter'], status: 'approved',
    photos: t5('mixed race female model elegant cape town',1501),
    background: 'Model from Stellenbosch wine region. Experience with luxury lifestyle and wine brands.',
    qualifications: 'Professional Modelling Certification | Hospitality Training',
    skills: ['Commercial modelling', 'Event hosting', 'Brand representation', 'Wine knowledge', 'English, Afrikaans'],
    hobbies: ['Wine tasting', 'Travel', 'Photography'],
    talents: ['Commercial campaigns', 'Wine brand events', 'Tourism promotions'],
    workExperience: '5+ years modelling. Wine industry and lifestyle brands.',
    availability: 'Available with 1 week notice. Stellenbosch based.'
  },
  {
    id: '16', firstName: 'Tamzin', lastName: 'Abrahams', city: 'Cape Town', area: 'Gardens', race: 'Coloured', bodyType: 'Curvy', heightCm: 165, categories: ['Hostess','Bottle Girl'], status: 'approved',
    photos: t5('coloured female hostess glamorous cape town',1601),
    background: 'Glamorous hostess from Gardens. Specialist in upscale nightlife and event hosting.',
    qualifications: 'Event Management Diploma | Luxury Hospitality Certification',
    skills: ['Event hosting', 'Bottle service', 'VIP management', 'English, Afrikaans'],
    hobbies: ['Events', 'Fashion', 'Social scene'],
    talents: ['Luxury events', 'Nightlife hosting', 'VIP service'],
    workExperience: '5+ years nightlife hosting. Premium Cape Town venues.',
    availability: 'Available evenings and weekends. Peak availability Fri-Sat.'
  },
  {
    id: '17', firstName: 'Lindi', lastName: 'Mkhize', city: 'Cape Town', area: 'Camps Bay', race: 'Black', bodyType: 'Slim', heightCm: 177, categories: ['Model','Brand Ambassador'], status: 'approved',
    photos: t5('tall african female model beach cape town sunset',1701),
    background: 'Tall model from Camps Bay. Expertise in beach and resort lifestyle content.',
    qualifications: 'Professional Modelling Certification | Photography Training',
    skills: ['Fashion modelling', 'Lifestyle content', 'Brand representation', 'Photography', 'Xhosa, English'],
    hobbies: ['Beach activities', 'Photography', 'Travel'],
    talents: ['Commercial campaigns', 'Lifestyle content', 'Brand ambassador'],
    workExperience: '6+ years modelling. Lifestyle and beach brands. Social media 30k+ followers.',
    availability: 'Available with 1 week notice. Flexible scheduling.'
  },
  {
    id: '18', firstName: 'Nicole', lastName: 'Swanepoel', city: 'Cape Town', area: 'Constantia', race: 'White', bodyType: 'Slim', heightCm: 174, categories: ['Model','Hostess'], status: 'approved',
    photos: t5('blonde south african female model classic elegant',1801),
    background: 'Sophisticated model from Constantia wine region. Refined aesthetic for luxury brands.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['High fashion modelling', 'Commercial work', 'Event hosting', 'Brand representation', 'Afrikaans, English'],
    hobbies: ['Fine dining', 'Art', 'Wine tasting'],
    talents: ['Fashion campaigns', 'Luxury brand events', 'Commercial ads'],
    workExperience: '7+ years modelling and hostessing. Luxury brands and wine industry.',
    availability: 'Available with 1-2 weeks notice. Flexible for premium clients.'
  },
  {
    id: '19', firstName: 'Ashleigh', lastName: 'Davids', city: 'Cape Town', area: 'Woodstock', race: 'Coloured', bodyType: 'Athletic', heightCm: 166, categories: ['Promoter','Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('athletic coloured female promoter vibrant urban',1901),
    background: 'Vibrant promoter from trendy Woodstock. Urban aesthetic and community connection.',
    qualifications: 'Event Management Diploma | Brand Activation Training',
    skills: ['Event hosting', 'Crowd engagement', 'Urban culture knowledge', 'Social media', 'English, Afrikaans'],
    hobbies: ['Urban culture', 'Art', 'Music festivals'],
    talents: ['Brand activations', 'Urban events', 'Festival hosting'],
    workExperience: '4+ years event promotion. Urban brands and community events.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice.'
  },
  {
    id: '20', firstName: 'Nompumelelo', lastName: 'Zulu', city: 'Cape Town', area: 'Century City', race: 'Black', bodyType: 'Athletic', heightCm: 171, categories: ['Model','Promoter'], status: 'approved',
    photos: t5('athletic african female model confident cape town',2001),
    background: 'Athletic model from Century City. Confident and professional presence.',
    qualifications: 'Professional Modelling Certification | Event Hosting Training',
    skills: ['Commercial modelling', 'Event hosting', 'Product promotion', 'Brand representation', 'Zulu, English'],
    hobbies: ['Fitness', 'Travel', 'Photography'],
    talents: ['Commercial campaigns', 'Brand activations', 'Event hosting'],
    workExperience: '4+ years modelling. Various commercial brands.',
    availability: 'Available with 1 week notice. Flexible scheduling.'
  },
  {
    id: '21', firstName: 'Jade', lastName: 'Williams', city: 'Cape Town', area: 'Green Point', race: 'Coloured', bodyType: 'Petite', heightCm: 159, categories: ['Hostess','Bottle Girl'], status: 'approved',
    photos: t5('petite mixed race female hostess glamorous',2101),
    background: 'Petite hostess from Green Point. Perfect for boutique and upscale events.',
    qualifications: 'Hospitality Management Diploma | Event Coordination Training',
    skills: ['Event hosting', 'Bottle service', 'VIP management', 'English, Afrikaans'],
    hobbies: ['Events', 'Fashion'],
    talents: ['Luxury events', 'Event hosting', 'VIP service'],
    workExperience: '4+ years luxury hospitality. High-end Cape Town venues.',
    availability: 'Available evenings and weekends. Premium rates.'
  },
  {
    id: '22', firstName: 'Hannah', lastName: 'Muller', city: 'Cape Town', area: 'Claremont', race: 'White', bodyType: 'Curvy', heightCm: 167, categories: ['Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('curvy blonde female brand ambassador',2201),
    background: 'Warm and friendly promoter from Claremont. Excellent with brand storytelling.',
    qualifications: 'Brand Marketing Diploma | Event Promotion Certification',
    skills: ['Brand promotion', 'Event hosting', 'Crowd engagement', 'Product storytelling', 'Afrikaans, English'],
    hobbies: ['Networking', 'Events', 'Community work'],
    talents: ['Brand activations', 'Event promotion', 'Product launches'],
    workExperience: '4+ years brand promotion. Various lifestyle brands.',
    availability: 'Available most weekends and flexible weekdays. 48 hours notice.'
  },
  {
    id: '23', firstName: 'Olivia', lastName: 'Krige', city: 'Cape Town', area: 'Bloubergstrand', race: 'White', bodyType: 'Slim', heightCm: 176, categories: ['Model','Hostess'], status: 'approved',
    photos: t5('tall blonde female model elegant cape town',2301),
    background: 'Tall elegant model from Bloubergstrand. Strong portfolio in commercial and editorial.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Fashion modelling', 'Commercial work', 'Event hosting', 'Brand representation', 'English, Afrikaans'],
    hobbies: ['Travel', 'Fashion', 'Photography'],
    talents: ['Fashion campaigns', 'Commercial ads', 'Event hosting'],
    workExperience: '6+ years modelling. Various fashion and commercial brands.',
    availability: 'Available with 1 week notice. Based Cape Town.'
  },
  {
    id: '24', firstName: 'Zara', lastName: 'Jacobs', city: 'Cape Town', area: 'Hout Bay', race: 'Coloured', bodyType: 'Athletic', heightCm: 170, categories: ['Model','Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('athletic mixed race female model coastal',2401),
    background: 'Athletic model from Hout Bay. Lifestyle and sports brand expertise.',
    qualifications: 'Professional Modelling Certification | Sports Marketing Training',
    skills: ['Commercial modelling', 'Sports brand campaigns', 'Event hosting', 'Brand representation', 'English, Afrikaans'],
    hobbies: ['Beach sports', 'Fitness', 'Outdoor activities'],
    talents: ['Sports brand campaigns', 'Lifestyle content', 'Brand ambassador'],
    workExperience: '5+ years modelling. Sports and lifestyle brands.',
    availability: 'Available with 1 week notice. Flexible scheduling.'
  },

  // DURBAN (9 talents)
  {
    id: '25', firstName: 'Zinhle', lastName: 'Dlamini', city: 'Durban', area: 'Umhlanga', race: 'Black', bodyType: 'Curvy', heightCm: 170, categories: ['Hostess','Bottle Girl'], status: 'approved',
    photos: t5('curvy african female model glamorous durban',2501),
    background: 'Glamorous hostess from Umhlanga. Expert in luxury hospitality and VIP events.',
    qualifications: 'Event Management Diploma | Luxury Hospitality Certification',
    skills: ['Event hosting', 'VIP management', 'Bottle service', 'Networking', 'Zulu, English'],
    hobbies: ['Events', 'Fashion', 'Networking'],
    talents: ['Luxury events', 'Gala dinners', 'VIP service'],
    workExperience: '7+ years luxury hospitality. Umhlanga premium venues and events.',
    availability: 'Available most evenings and weekends. Premium rates. Notice: 1 week.'
  },
  {
    id: '26', firstName: 'Priya', lastName: 'Naidoo', city: 'Durban', area: 'Ballito', race: 'Indian', bodyType: 'Slim', heightCm: 163, categories: ['Promoter','Hostess'], status: 'approved',
    photos: t5('indian female model elegant studio',2601),
    background: 'Energetic promoter from Ballito. Bilingual skills and community connection.',
    qualifications: 'Marketing Diploma | Brand Promotion Training | Event Management',
    skills: ['Event hosting', 'Community engagement', 'Bilingual (English, Hindi)', 'Social media', 'Dance (Bollywood, contemporary)'],
    hobbies: ['Bollywood dancing', 'Social media content', 'Community events'],
    talents: ['Community activations', 'Cultural festivals', 'Brand promotions'],
    workExperience: '4+ years brand promotion and hostessing. Community and cultural events.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice.'
  },
  {
    id: '27', firstName: 'Anisha', lastName: 'Govender', city: 'Durban', area: 'Westville', race: 'Indian', bodyType: 'Petite', heightCm: 158, categories: ['Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('petite indian female hostess elegant',2701),
    background: 'Professional and warm hostess from Westville. Specialist in cultural events.',
    qualifications: 'Hospitality Management Diploma | Event Coordination Training',
    skills: ['Event hosting', 'Cultural event knowledge', 'Multilingual (English, Hindi, Zulu)', 'Service excellence'],
    hobbies: ['Cooking', 'Event planning', 'Volunteer work'],
    talents: ['Cultural events', 'Wedding hostessing', 'Corporate dinners'],
    workExperience: '6+ years upscale hospitality. Cultural and corporate events.',
    availability: 'Available most evenings and weekends. Premium rates. Notice: 1 week.'
  },
  {
    id: '28', firstName: 'Nomfundo', lastName: 'Shabalala', city: 'Durban', area: 'La Lucia', race: 'Black', bodyType: 'Athletic', heightCm: 173, categories: ['Model','Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('athletic african female model fashion durban',2801),
    background: 'Athletic model from La Lucia. Strong experience in sports and lifestyle brands.',
    qualifications: 'Professional Modelling Certification | Sports Marketing Training',
    skills: ['Commercial modelling', 'Sports brand campaigns', 'Event hosting', 'Brand representation', 'Zulu, English'],
    hobbies: ['Fitness training', 'Beach activities', 'Photography'],
    talents: ['Sports brand campaigns', 'Commercial ads', 'Lifestyle content'],
    workExperience: '5+ years modelling. Sports and lifestyle brands.',
    availability: 'Available with 1 week notice. Flexible scheduling.'
  },
  {
    id: '29', firstName: 'Raveena', lastName: 'Pillay', city: 'Durban', area: 'Morningside', race: 'Indian', bodyType: 'Slim', heightCm: 166, categories: ['Model','Hostess'], status: 'approved',
    photos: t5('indian female model elegant sari',2901),
    background: 'Elegant model from Morningside. Cultural fusion in fashion and events.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Fashion modelling', 'Cultural fashion expertise', 'Event hosting', 'Brand representation', 'English, Hindi'],
    hobbies: ['Fashion design', 'Travel', 'Art'],
    talents: ['Fashion campaigns', 'Cultural events', 'Event hosting'],
    workExperience: '5+ years modelling. Fashion and cultural events.',
    availability: 'Available with 1 week notice. Based Durban.'
  },
  {
    id: '30', firstName: 'Siphesihle', lastName: 'Buthelezi', city: 'Durban', area: 'Berea', race: 'Black', bodyType: 'Slim', heightCm: 176, categories: ['Model','Hostess','Bottle Girl'], status: 'approved',
    photos: t5('tall slim african female model glamorous gold dress',3001),
    background: 'Tall model from Berea. Sophisticated presence for luxury events.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Fashion modelling', 'Event hosting', 'Bottle service', 'Brand representation', 'Zulu, English'],
    hobbies: ['Fashion', 'Travel', 'Photography'],
    talents: ['Fashion campaigns', 'Luxury events', 'Event hosting'],
    workExperience: '6+ years modelling and hostessing. Fashion and luxury events.',
    availability: 'Available with 1 week notice. Flexible for premium clients.'
  },
  {
    id: '31', firstName: 'Jessica', lastName: 'van Niekerk', city: 'Durban', area: 'Hillcrest', race: 'White', bodyType: 'Athletic', heightCm: 170, categories: ['Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('athletic brunette female promoter outdoor',3101),
    background: 'Energetic promoter from Hillcrest. Excellent with active lifestyle brands.',
    qualifications: 'Event Management Diploma | Brand Promotion Certification',
    skills: ['Event hosting', 'Brand promotion', 'Crowd engagement', 'Sports knowledge', 'Afrikaans, English'],
    hobbies: ['Fitness', 'Outdoor activities', 'Sports'],
    talents: ['Brand activations', 'Sports events', 'Active lifestyle promotions'],
    workExperience: '4+ years brand promotion. Sports and active lifestyle brands.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice.'
  },
  {
    id: '32', firstName: 'Neha', lastName: 'Maharaj', city: 'Durban', area: 'Phoenix', race: 'Indian', bodyType: 'Curvy', heightCm: 162, categories: ['Hostess','Promoter'], status: 'approved',
    photos: t5('curvy indian female hostess elegant',3201),
    background: 'Warm and hospitable hostess from Phoenix. Cultural event specialist.',
    qualifications: 'Hospitality Management Diploma | Event Coordination Training',
    skills: ['Event hosting', 'Cultural event knowledge', 'Multilingual (English, Hindi)', 'Hospitality excellence'],
    hobbies: ['Events', 'Cooking', 'Community service'],
    talents: ['Cultural events', 'Event hosting', 'Community events'],
    workExperience: '5+ years hospitality. Cultural and community events.',
    availability: 'Available most weekends and flexible weekdays. Notice: 1 week.'
  },
  {
    id: '33', firstName: 'Ayanda', lastName: 'Mthembu', city: 'Durban', area: 'Glenwood', race: 'Black', bodyType: 'Athletic', heightCm: 173, categories: ['Model','Brand Ambassador','Promoter'], status: 'approved',
    photos: t5('athletic african female model powerful confident',3301),
    background: 'Powerful model from Glenwood. Sports and wellness brand expertise.',
    qualifications: 'Professional Modelling Certification | Sports Marketing Training',
    skills: ['Commercial modelling', 'Sports brand campaigns', 'Brand representation', 'Fitness knowledge', 'Zulu, English'],
    hobbies: ['Fitness training', 'Sports', 'Wellness'],
    talents: ['Sports brand campaigns', 'Wellness content', 'Brand ambassador'],
    workExperience: '5+ years modelling. Sports and wellness brands.',
    availability: 'Available with 1 week notice. Flexible scheduling.'
  },

  // PRETORIA (5 talents)
  {
    id: '34', firstName: 'Kelebogile', lastName: 'Phiri', city: 'Pretoria', area: 'Menlyn', race: 'Black', bodyType: 'Slim', heightCm: 171, categories: ['Model','Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('african female model professional pretoria',3401),
    background: 'Professional model from Menlyn. Corporate and commercial event specialist.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Commercial modelling', 'Event hosting', 'Brand representation', 'Corporate knowledge', 'Setswana, English'],
    hobbies: ['Fashion', 'Travel', 'Professional development'],
    talents: ['Commercial campaigns', 'Corporate events', 'Brand ambassador'],
    workExperience: '6+ years modelling and hostessing. Corporate and commercial events.',
    availability: 'Available with 1 week notice. Flexible scheduling. Based Pretoria.'
  },
  {
    id: '35', firstName: 'Mariska', lastName: 'Pretorius', city: 'Pretoria', area: 'Brooklyn', race: 'White', bodyType: 'Slim', heightCm: 175, categories: ['Model','Hostess'], status: 'approved',
    photos: t5('tall blonde female model classic elegant',3501),
    background: 'Elegant tall model from Brooklyn. High-end fashion and corporate events.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Fashion modelling', 'Event hosting', 'Corporate relations', 'Brand representation', 'Afrikaans, English'],
    hobbies: ['Fashion', 'Fine dining', 'Travel'],
    talents: ['Fashion shows', 'Corporate events', 'Luxury brand events'],
    workExperience: '7+ years modelling. Fashion week and corporate events.',
    availability: 'Available with 1-2 weeks notice. Flexible for quality clients.'
  },
  {
    id: '36', firstName: 'Dineo', lastName: 'Mahlangu', city: 'Pretoria', area: 'Hatfield', race: 'Black', bodyType: 'Petite', heightCm: 161, categories: ['Promoter','Bottle Girl'], status: 'approved',
    photos: t5('petite african female promoter vibrant',3601),
    background: 'Vibrant petite promoter from Hatfield. Student-friendly events and community work.',
    qualifications: 'Event Promotion Certification | Community Engagement Training',
    skills: ['Crowd engagement', 'Event hosting', 'Product promotion', 'Setswana, English'],
    hobbies: ['Community events', 'Music festivals', 'Social causes'],
    talents: ['Student events', 'Community promotions', 'Festival work'],
    workExperience: '3+ years event promotion. Student and community events.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice. Reasonable rates.'
  },
  {
    id: '37', firstName: 'Boitumelo', lastName: 'Moagi', city: 'Pretoria', area: 'Waterkloof', race: 'Black', bodyType: 'Athletic', heightCm: 174, categories: ['Model','Brand Ambassador'], status: 'approved',
    photos: t5('athletic african female model power pose',3701),
    background: 'Athletic empowering model from Waterkloof. Corporate and fitness brand specialist.',
    qualifications: 'Professional Modelling Certification | Corporate Training',
    skills: ['Commercial modelling', 'Corporate brand representation', 'Fitness knowledge', 'English, Setswana'],
    hobbies: ['Fitness', 'Empowerment work', 'Professional development'],
    talents: ['Corporate campaigns', 'Fitness brand events', 'Empowerment content'],
    workExperience: '4+ years modelling. Corporate and fitness brands.',
    availability: 'Available with 1 week notice. Flexible scheduling.'
  },
  {
    id: '38', firstName: 'Leigh-Ann', lastName: 'Joubert', city: 'Pretoria', area: 'Centurion', race: 'White', bodyType: 'Curvy', heightCm: 167, categories: ['Hostess','Promoter','Brand Ambassador'], status: 'approved',
    photos: t5('curvy brunette female hostess elegant corporate',3801),
    background: 'Warm and professional hostess from Centurion. Corporate event specialist.',
    qualifications: 'Event Management Diploma | Corporate Hospitality Training',
    skills: ['Event hosting', 'Corporate relations', 'Brand promotion', 'VIP management', 'Afrikaans, English'],
    hobbies: ['Corporate events', 'Networking', 'Professional development'],
    talents: ['Corporate events', 'Brand activations', 'Event hosting'],
    workExperience: '6+ years corporate hostessing. Premium corporate events.',
    availability: 'Available most evenings and weekends. Premium rates. Notice: 1 week.'
  },

  // PORT ELIZABETH (3 talents)
  {
    id: '39', firstName: 'Siyanda', lastName: 'Mgwaba', city: 'Port Elizabeth', area: 'Summerstrand', race: 'Black', bodyType: 'Slim', heightCm: 172, categories: ['Model','Promoter'], status: 'approved',
    photos: t5('slim african female model coastal beach',3901),
    background: 'Coastal model from Summerstrand. Beach and tourism brand expertise.',
    qualifications: 'Professional Modelling Certification | Event Promotion Training',
    skills: ['Commercial modelling', 'Event hosting', 'Beach brand knowledge', 'Xhosa, English'],
    hobbies: ['Beach activities', 'Travel', 'Photography'],
    talents: ['Commercial campaigns', 'Beach brand events', 'Tourism promotions'],
    workExperience: '4+ years modelling. Coastal and tourism brands.',
    availability: 'Available with 1 week notice. Based Port Elizabeth.'
  },
  {
    id: '40', firstName: 'Carmen', lastName: 'de Villiers', city: 'Port Elizabeth', area: 'Walmer', race: 'White', bodyType: 'Athletic', heightCm: 168, categories: ['Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('athletic brunette female brand ambassador',4001),
    background: 'Athletic hostess from Walmer. Experienced with corporate and event hosting.',
    qualifications: 'Event Management Diploma | Brand Training',
    skills: ['Event hosting', 'Brand promotion', 'Corporate relations', 'Afrikaans, English'],
    hobbies: ['Events', 'Fitness', 'Networking'],
    talents: ['Corporate events', 'Brand activations', 'Event hosting'],
    workExperience: '4+ years hostessing. Corporate and brand events.',
    availability: 'Available with reasonable notice. Based Port Elizabeth.'
  },
  {
    id: '41', firstName: 'Lusanda', lastName: 'Mdingi', city: 'Port Elizabeth', area: 'Newton Park', race: 'Black', bodyType: 'Curvy', heightCm: 165, categories: ['Promoter','Hostess','Bottle Girl'], status: 'approved',
    photos: t5('curvy african female promoter vibrant',4101),
    background: 'Vibrant promoter from Newton Park. Event and nightlife specialist.',
    qualifications: 'Event Management Diploma | Brand Promotion Training',
    skills: ['Event hosting', 'Crowd engagement', 'Bottle service', 'Brand promotion', 'Xhosa, English'],
    hobbies: ['Events', 'Nightlife', 'Community work'],
    talents: ['Event hosting', 'Brand activations', 'Nightlife promotion'],
    workExperience: '4+ years event hosting. Event and nightlife venues.',
    availability: 'Available most evenings and weekends. Notice: 48 hours.'
  },

  // BLOEMFONTEIN (2 talents)
  {
    id: '42', firstName: 'Lebogang', lastName: 'Moloi', city: 'Bloemfontein', area: 'Westdene', race: 'Black', bodyType: 'Slim', heightCm: 170, categories: ['Model','Hostess'], status: 'approved',
    photos: t5('slim african female model elegant bloemfontein',4201),
    background: 'Professional model from Westdene. Corporate and fashion event experience.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Commercial modelling', 'Event hosting', 'Brand representation', 'Sesotho, English'],
    hobbies: ['Fashion', 'Travel', 'Professional development'],
    talents: ['Commercial campaigns', 'Event hosting', 'Brand ambassador'],
    workExperience: '4+ years modelling and hostessing. Corporate and fashion events.',
    availability: 'Available with 1 week notice. Based Bloemfontein.'
  },
  {
    id: '43', firstName: 'Elmien', lastName: 'Steyn', city: 'Bloemfontein', area: 'Universitas', race: 'White', bodyType: 'Slim', heightCm: 173, categories: ['Model','Brand Ambassador'], status: 'approved',
    photos: t5('blonde female model natural light outdoor',4301),
    background: 'Natural beauty model from Universitas. Commercial and lifestyle brand experience.',
    qualifications: 'Professional Modelling Certification | Marketing Training',
    skills: ['Commercial modelling', 'Lifestyle content', 'Brand representation', 'Afrikaans, English'],
    hobbies: ['Outdoor activities', 'Travel', 'Photography'],
    talents: ['Commercial campaigns', 'Lifestyle content', 'Brand ambassador'],
    workExperience: '4+ years modelling. Commercial and lifestyle brands.',
    availability: 'Available with 1 week notice. Based Bloemfontein.'
  },

  // EAST LONDON (2 talents)
  {
    id: '44', firstName: 'Asanda', lastName: 'Ntsika', city: 'East London', area: 'Beacon Bay', race: 'Black', bodyType: 'Athletic', heightCm: 169, categories: ['Promoter','Hostess'], status: 'approved',
    photos: t5('athletic african female promoter confident',4401),
    background: 'Confident promoter from Beacon Bay. Community and event experience.',
    qualifications: 'Event Management Diploma | Community Engagement Training',
    skills: ['Event hosting', 'Crowd engagement', 'Community work', 'Xhosa, English'],
    hobbies: ['Community events', 'Fitness', 'Social causes'],
    talents: ['Event hosting', 'Community promotions', 'Brand activations'],
    workExperience: '3+ years event hosting. Community and brand events.',
    availability: 'Available weekends and flexible weekdays. 48 hours notice.'
  },
  {
    id: '45', firstName: 'Tarryn', lastName: 'Smith', city: 'East London', area: 'Gonubie', race: 'White', bodyType: 'Petite', heightCm: 160, categories: ['Hostess','Bottle Girl'], status: 'approved',
    photos: t5('petite brunette female hostess elegant',4501),
    background: 'Professional petite hostess from Gonubie. Event and hospitality specialist.',
    qualifications: 'Hospitality Management Diploma | Event Coordination Training',
    skills: ['Event hosting', 'Bottle service', 'VIP management', 'Afrikaans, English'],
    hobbies: ['Events', 'Hospitality', 'Professional service'],
    talents: ['Event hosting', 'Luxury events', 'VIP service'],
    workExperience: '4+ years hospitality. Event and luxury venues.',
    availability: 'Available most evenings and weekends. Notice: 1 week.'
  },

  // POLOKWANE (2 talents)
  {
    id: '46', firstName: 'Masego', lastName: 'Mabotja', city: 'Polokwane', area: 'Bendor', race: 'Black', bodyType: 'Slim', heightCm: 174, categories: ['Model','Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('tall elegant african female model professional',4601),
    background: 'Elegant model from Bendor. Professional and versatile for various events.',
    qualifications: 'Professional Modelling Certification | Event Hosting Diploma',
    skills: ['Commercial modelling', 'Event hosting', 'Brand representation', 'Sepedi, English'],
    hobbies: ['Fashion', 'Travel', 'Professional development'],
    talents: ['Commercial campaigns', 'Event hosting', 'Brand ambassador'],
    workExperience: '4+ years modelling and hostessing. Various brands and events.',
    availability: 'Available with 1 week notice. Based Polokwane.'
  },
  {
    id: '47', firstName: 'Tshepiso', lastName: 'Malatji', city: 'Polokwane', area: 'Flora Park', race: 'Black', bodyType: 'Curvy', heightCm: 166, categories: ['Promoter','Hostess'], status: 'approved',
    photos: t5('curvy african female promoter warm smile',4701),
    background: 'Warm and hospitable hostess from Flora Park. Community-focused events.',
    qualifications: 'Event Management Diploma | Hospitality Training',
    skills: ['Event hosting', 'Community engagement', 'Hospitality excellence', 'Sepedi, English'],
    hobbies: ['Community events', 'Hospitality', 'Social work'],
    talents: ['Community events', 'Event hosting', 'Brand promotions'],
    workExperience: '3+ years hospitality and event hosting. Community events.',
    availability: 'Available weekends and flexible weekdays. Notice: 1 week.'
  },

  // NELSPRUIT / MBOMBELA (2 talents)
  {
    id: '48', firstName: 'Nonhle', lastName: 'Nkosi', city: 'Nelspruit', area: 'Riverside Park', race: 'Black', bodyType: 'Athletic', heightCm: 171, categories: ['Model','Promoter'], status: 'approved',
    photos: t5('athletic african female model outdoor nature',4801),
    background: 'Athletic model from Riverside Park. Outdoor and adventure brand experience.',
    qualifications: 'Professional Modelling Certification | Outdoor Sports Training',
    skills: ['Commercial modelling', 'Event hosting', 'Outdoor brand knowledge', 'Zulu, English'],
    hobbies: ['Outdoor activities', 'Adventure sports', 'Nature photography'],
    talents: ['Commercial campaigns', 'Outdoor brand events', 'Adventure content'],
    workExperience: '3+ years modelling. Outdoor and adventure brands.',
    availability: 'Available with 1 week notice. Based Nelspruit.'
  },
  {
    id: '49', firstName: 'Chanel', lastName: 'Visser', city: 'Nelspruit', area: 'West Acres', race: 'White', bodyType: 'Slim', heightCm: 168, categories: ['Hostess','Brand Ambassador'], status: 'approved',
    photos: t5('slim blonde female hostess professional',4901),
    background: 'Professional hostess from West Acres. Event and hospitality expertise.',
    qualifications: 'Hospitality Management Diploma | Event Coordination Training',
    skills: ['Event hosting', 'Brand representation', 'Customer service', 'Afrikaans, English'],
    hobbies: ['Events', 'Hospitality', 'Professional service'],
    talents: ['Event hosting', 'Brand activations', 'Hospitality'],
    workExperience: '4+ years hospitality. Event venues and brand events.',
    availability: 'Available with reasonable notice. Based Nelspruit.'
  },

  // KIMBERLEY (1 talent)
  {
    id: '50', firstName: 'Keabetswe', lastName: 'Tshwane', city: 'Kimberley', area: 'Royldene', race: 'Black', bodyType: 'Slim', heightCm: 170, categories: ['Model','Promoter'], status: 'approved',
    photos: t5('slim african female model elegant kimberley',5001),
    background: 'Professional model from Kimberley. Commercial and local event experience.',
    qualifications: 'Professional Modelling Certification | Event Promotion Training',
    skills: ['Commercial modelling', 'Event hosting', 'Brand representation', 'Setswana, English'],
    hobbies: ['Fashion', 'Community events', 'Professional development'],
    talents: ['Commercial campaigns', 'Event hosting', 'Brand ambassador'],
    workExperience: '3+ years modelling. Local and regional brands.',
    availability: 'Available with 1 week notice. Based Kimberley.'
  },
];

const GIGS = [
  { id: 'g1', title: 'Summer Festival Promoters', city: 'Johannesburg', venue: 'Marks Park, Emmarentia', date: '15-16 Feb 2025', needed: 20, categories: ['Promoter','Brand Ambassador'], comp: 'R1,500/day', type: 'Music Festival', desc: 'We need 20 energetic promoters for a major summer music festival. Must be enthusiastic and good with crowds.', interests: 8 },
  { id: 'g2', title: 'Luxury Brand Launch Hostesses', city: 'Cape Town', venue: 'V&A Waterfront', date: '8 Mar 2025', needed: 8, categories: ['Hostess','Model'], comp: 'R2,000/evening', type: 'Brand Launch', desc: 'Exclusive product launch for a premium fashion brand. Looking for sophisticated hostesses with luxury event experience.', interests: 5 },
  { id: 'g3', title: 'Corporate Golf Day Models', city: 'Pretoria', venue: 'Silver Lakes Golf Estate', date: '22 Mar 2025', needed: 6, categories: ['Model','Hostess'], comp: 'R1,800/day', type: 'Golf Day', desc: 'Annual corporate golf day. Need models for registration, beverage service, and prize-giving ceremony.', interests: 3 },
  { id: 'g4', title: 'LIV Golf South Africa - Event Hostesses & Ambience Models', city: 'Johannesburg', venue: 'The Wanderers Club, Illovo', date: '12-14 Apr 2025', needed: 30, categories: ['Model','Hostess','Ambience','Brand Ambassador'], comp: 'R3,500/day', type: 'Golf Day', desc: 'LIV Golf is coming to South Africa! We need 30 premium hostesses and ambience models for a 3-day international golf tournament. Roles include VIP hospitality lounge hosting, player registration, beverage cart models, branded activation stands, and on-course ambience. Must be professional, well-groomed, and comfortable in an upscale international sporting environment. International media exposure guaranteed.', interests: 18 },
  { id: 'g5', title: 'SAICA Engineering Golf Day - Hostesses & Registration Models', city: 'Johannesburg', venue: 'Houghton Golf Club', date: '5 May 2025', needed: 10, categories: ['Hostess','Model','Brand Ambassador'], comp: 'R2,200/day', type: 'Golf Day', desc: 'Annual SAICA Engineering charity golf day at the prestigious Houghton Golf Club. Need 10 professional hostesses and models for player registration, hole sponsorship activations, beverage service on course, and prize-giving ceremony hosting. Corporate dress code. Must be punctual, articulate, and comfortable engaging with senior executives and professionals.', interests: 6 },
];

const BOOKINGS = [
  { id: 'b1', company: 'Elevation Events', type: 'Brand Activation', city: 'Johannesburg', venue: 'Sandton City Mall', date: '28 Feb 2025', count: 5, status: 'pending',
    talentIds: ['1', '3', '5', '7', '8'],
    notes: 'Looking for energetic promoters for weekend activation. Must be confident and well-spoken.' },
  { id: 'b2', company: 'Cape Fashion Group', type: 'Fashion Show', city: 'Cape Town', venue: 'CTICC', date: '20 Mar 2025', count: 8, status: 'confirmed',
    talentIds: ['14', '15', '17', '18', '20', '21', '23', '24'],
    notes: 'High-end fashion show. Models need runway experience. Rehearsal on 19 Mar.' },
  { id: 'b3', company: 'Elevation Events', type: 'Conference', city: 'Durban', venue: 'Durban ICC', date: '10 Apr 2025', count: 3, status: 'reviewed',
    talentIds: ['25', '26', '27'],
    notes: 'Corporate conference registration and hosting. Professional attire required.' },
];

const OUTFIT_CATEGORIES = ['All', 'Events', 'Promotions', 'Club', 'Golf Days', 'Activations', 'Fashion Shows'];

const DEMO_OUTFITS = [
  // ── Events (10) ──
  {
    id: 'e1', name: 'Elegant Gold Bodycon', category: 'Events', price: 1200,
    description: 'Sleek gold bodycon dress perfect for corporate events and award ceremonies. Features a subtle shimmer finish.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Gold', 'Black', 'Silver'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('elegant gold bodycon dress, corporate event fashion, luxury, dark background')}&aspect=3:4&seed=9001`,
  },
  {
    id: 'e2', name: 'Classic Black Cocktail', category: 'Events', price: 950,
    description: 'Timeless black cocktail dress with modern cut. Ideal for conferences, galas, and upscale evening events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Navy', 'Burgundy'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('classic black cocktail dress, elegant modern cut, luxury fashion')}&aspect=3:4&seed=9002`,
  },
  {
    id: 'e3', name: 'Red Carpet Gown', category: 'Events', price: 2500,
    description: 'Stunning floor-length gown for award ceremonies and high-profile events.',
    sizes: ['S', 'M', 'L'], colors: ['Red', 'Emerald', 'Royal Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('stunning red floor-length evening gown, red carpet fashion, glamorous')}&aspect=3:4&seed=9003`,
  },
  {
    id: 'e4', name: 'Champagne Satin Slip', category: 'Events', price: 1100,
    description: 'Luxurious satin slip dress in champagne tones. Effortlessly chic for cocktail receptions and evening dinners.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Champagne', 'Blush', 'Ivory'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('champagne satin slip dress, elegant cocktail reception, soft lighting')}&aspect=3:4&seed=9101`,
  },
  {
    id: 'e5', name: 'Navy Structured Blazer Dress', category: 'Events', price: 1350,
    description: 'Sharp double-breasted blazer dress. Powerful silhouette for corporate galas and awards nights.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Navy', 'Black', 'Charcoal'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('navy structured blazer dress, corporate gala fashion, power dressing')}&aspect=3:4&seed=9102`,
  },
  {
    id: 'e6', name: 'Emerald Velvet Midi', category: 'Events', price: 1450,
    description: 'Rich emerald velvet midi dress with a sweetheart neckline. Ideal for winter galas and formal dinners.',
    sizes: ['S', 'M', 'L'], colors: ['Emerald', 'Burgundy', 'Midnight Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('emerald green velvet midi dress, winter gala fashion, elegant')}&aspect=3:4&seed=9103`,
  },
  {
    id: 'e7', name: 'White Column Gown', category: 'Events', price: 2200,
    description: 'Minimalist white column gown with sculptural shoulders. Statement piece for charity balls.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Ivory', 'Blush'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('white column gown, sculptural shoulders, charity ball fashion, minimalist elegance')}&aspect=3:4&seed=9104`,
  },
  {
    id: 'e8', name: 'Beaded Cape Dress', category: 'Events', price: 2800,
    description: 'Showstopping beaded cape overlay dress. Premium choice for product launches and VIP evenings.',
    sizes: ['S', 'M', 'L'], colors: ['Silver', 'Gold', 'Black'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('beaded cape overlay dress, VIP event fashion, luxury silver beading')}&aspect=3:4&seed=9105`,
  },
  {
    id: 'e9', name: 'Blush Tulle A-Line', category: 'Events', price: 1650,
    description: 'Romantic blush tulle A-line dress. Dreamy look for garden parties and evening receptions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Blush', 'Lavender', 'Mint'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('blush pink tulle A-line dress, garden party fashion, romantic dreamy')}&aspect=3:4&seed=9106`,
  },
  {
    id: 'e10', name: 'Metallic Wrap Dress', category: 'Events', price: 1050,
    description: 'Flattering metallic wrap dress that catches every light. Versatile for cocktail hours and corporate awards.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose Gold', 'Silver', 'Bronze'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('metallic rose gold wrap dress, cocktail fashion, shimmering fabric')}&aspect=3:4&seed=9107`,
  },

  // ── Promotions (10) ──
  {
    id: 'p1', name: 'Branded Polo Set', category: 'Promotions', price: 450,
    description: 'Professional branded polo shirt set with matching skirt. Perfect for in-store promotions and brand activations.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red', 'Royal Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('professional white polo shirt and skirt set, brand ambassador uniform')}&aspect=3:4&seed=9004`,
  },
  {
    id: 'p2', name: 'Promo Bodysuit & Shorts', category: 'Promotions', price: 380,
    description: 'Eye-catching bodysuit and high-waisted shorts combo for outdoor promotions and festivals.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Pink', 'Yellow'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('stylish bodysuit and high-waisted shorts set, promotional model outfit')}&aspect=3:4&seed=9005`,
  },
  {
    id: 'p3', name: 'Branded Crop Top & Leggings', category: 'Promotions', price: 420,
    description: 'Sporty crop top and leggings set. Maximum branding space, perfect for fitness and wellness promotions.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Neon Green', 'Orange'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sporty branded crop top and leggings set, fitness promotion outfit')}&aspect=3:4&seed=9201`,
  },
  {
    id: 'p4', name: 'Wraparound Apron Dress', category: 'Promotions', price: 350,
    description: 'Cute wraparound apron dress for food & beverage brand promotions. Easy branding on front panel.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Red', 'White', 'Black', 'Green'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('wraparound apron dress, food brand promotion outfit, cheerful')}&aspect=3:4&seed=9202`,
  },
  {
    id: 'p5', name: 'Branded A-Line Mini', category: 'Promotions', price: 480,
    description: 'Structured A-line mini dress with large brandable chest and back panels. Ideal for experiential activations.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('white A-line mini dress, brand activation outfit, clean modern')}&aspect=3:4&seed=9203`,
  },
  {
    id: 'p6', name: 'Tech Expo Jumpsuit', category: 'Promotions', price: 520,
    description: 'Modern slim-fit jumpsuit for tech expos and trade shows. Clean lines with zip-front detail.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Grey'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('modern slim fit jumpsuit, tech expo promotional outfit, futuristic')}&aspect=3:4&seed=9204`,
  },
  {
    id: 'p7', name: 'Festival Bralette & Skirt', category: 'Promotions', price: 360,
    description: 'Fun bralette and flared skirt combo for outdoor festivals and sampling events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Yellow', 'Pink', 'White', 'Turquoise'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('colorful bralette and flared skirt set, outdoor festival promo outfit')}&aspect=3:4&seed=9205`,
  },
  {
    id: 'p8', name: 'Promo Blazer & Hot Pants', category: 'Promotions', price: 550,
    description: 'Sharp cropped blazer paired with tailored hot pants. Premium look for liquor and lifestyle brands.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'White', 'Red', 'Gold'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('cropped blazer and tailored hot pants, luxury brand promotion outfit')}&aspect=3:4&seed=9206`,
  },
  {
    id: 'p9', name: 'Sampler Tee & Mini', category: 'Promotions', price: 300,
    description: 'Casual branded tee tucked into a high-waisted mini skirt. Budget-friendly for large teams.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red', 'Blue', 'Green'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('casual branded t-shirt and mini skirt, promotional sampling outfit')}&aspect=3:4&seed=9207`,
  },
  {
    id: 'p10', name: 'High-Vis Branded Vest Set', category: 'Promotions', price: 400,
    description: 'High-visibility branded vest with matching shorts. Great for outdoor road-shows and sports events.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Neon Yellow', 'Neon Orange', 'Neon Pink'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('neon high-vis branded vest and shorts, outdoor roadshow promotional')}&aspect=3:4&seed=9208`,
  },

  // ── Club (10) ──
  {
    id: 'c1', name: 'Sequin Mini Dress', category: 'Club', price: 850,
    description: 'Show-stopping sequin mini dress for club events and nightlife. Dazzling under club lights.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Silver', 'Gold', 'Black', 'Pink'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sequin mini dress, nightclub fashion, sparkly glamorous, dark neon lighting')}&aspect=3:4&seed=9006`,
  },
  {
    id: 'c2', name: 'Bottle Girl Corset Set', category: 'Club', price: 680,
    description: 'Premium corset top and matching skirt set designed for bottle service. Customizable with venue branding.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White', 'Gold'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('black corset top and mini skirt set, VIP bottle service outfit')}&aspect=3:4&seed=9007`,
  },
  {
    id: 'c3', name: 'Neon Mesh Bodysuit', category: 'Club', price: 580,
    description: 'Bold neon mesh bodysuit for themed club nights. Semi-sheer with built-in modesty panels.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Neon Pink', 'Neon Green', 'Neon Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('neon mesh bodysuit, nightclub themed party outfit, UV glow')}&aspect=3:4&seed=9301`,
  },
  {
    id: 'c4', name: 'Vinyl Biker Shorts Set', category: 'Club', price: 620,
    description: 'Edgy vinyl bralette and biker shorts set. Perfect for hip-hop nights and urban club events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('vinyl bralette and biker shorts set, urban nightclub fashion, edgy')}&aspect=3:4&seed=9302`,
  },
  {
    id: 'c5', name: 'Crystal Fringe Dress', category: 'Club', price: 1200,
    description: 'Dazzling crystal fringe mini dress that moves with every step. A head-turner on the dance floor.',
    sizes: ['XS', 'S', 'M'], colors: ['Silver', 'Gold', 'Iridescent'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('crystal fringe mini dress, dance floor fashion, sparkling movement')}&aspect=3:4&seed=9303`,
  },
  {
    id: 'c6', name: 'Velvet Bustier Mini', category: 'Club', price: 750,
    description: 'Rich velvet bustier mini dress with boning detail. Sophisticated nightlife elegance.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Burgundy', 'Black', 'Emerald', 'Navy'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('velvet bustier mini dress, sophisticated nightclub fashion, moody lighting')}&aspect=3:4&seed=9304`,
  },
  {
    id: 'c7', name: 'Cut-Out Bandage Dress', category: 'Club', price: 780,
    description: 'Strategic cut-out bandage dress that sculpts the body. Paired perfectly with strappy heels.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'White', 'Red', 'Nude'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('cut-out bandage dress, body sculpting nightclub fashion, sexy elegant')}&aspect=3:4&seed=9305`,
  },
  {
    id: 'c8', name: 'Metallic Halter Top Set', category: 'Club', price: 550,
    description: 'Metallic halter top with matching high-waist pants. Futuristic glam for themed club nights.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Silver', 'Gold', 'Rose Gold'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('metallic halter top and pants set, futuristic club outfit, shiny')}&aspect=3:4&seed=9306`,
  },
  {
    id: 'c9', name: 'Feather Trim Mini', category: 'Club', price: 950,
    description: 'Statement feather trim mini dress. Dramatic and glamorous for VIP and exclusive club events.',
    sizes: ['XS', 'S', 'M'], colors: ['Black', 'White', 'Pink', 'Red'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('feather trim mini dress, exclusive VIP club fashion, dramatic glamorous')}&aspect=3:4&seed=9307`,
  },
  {
    id: 'c10', name: 'Lace-Up Catsuit', category: 'Club', price: 720,
    description: 'Figure-hugging lace-up catsuit for theme nights and dance events. Full stretch comfort.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('lace-up catsuit, figure hugging nightclub outfit, dance event fashion')}&aspect=3:4&seed=9308`,
  },

  // ── Golf Days (10) ──
  {
    id: 'g1', name: 'Golf Day Dress', category: 'Golf Days', price: 550,
    description: 'Elegant yet sporty golf day dress. Perfect for corporate golf days with room for branding.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Light Blue', 'Pink'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sporty elegant white golf dress, women golf fashion, green course background')}&aspect=3:4&seed=9008`,
  },
  {
    id: 'g2', name: 'Golf Polo & Pleated Skort', category: 'Golf Days', price: 480,
    description: 'Classic polo top with pleated skort combo. Clean corporate look for golf day hospitality.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Pink', 'Mint'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('golf polo and pleated skort, women golf hospitality outfit, green course')}&aspect=3:4&seed=9401`,
  },
  {
    id: 'g3', name: 'Sleeveless Golf Shift', category: 'Golf Days', price: 520,
    description: 'Breezy sleeveless shift dress for warm-weather golf days. UV-protective fabric.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Coral', 'Light Blue', 'Lemon'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sleeveless shift dress, summer golf day fashion, bright and airy')}&aspect=3:4&seed=9402`,
  },
  {
    id: 'g4', name: 'Athletic Golf Jumpsuit', category: 'Golf Days', price: 600,
    description: 'Sporty one-piece golf jumpsuit. Moves with you and looks sharp on and off the course.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Navy'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('athletic women golf jumpsuit, sporty one-piece, green course background')}&aspect=3:4&seed=9403`,
  },
  {
    id: 'g5', name: 'Zip-Front Golf Dress', category: 'Golf Days', price: 530,
    description: 'Modern zip-front golf dress with moisture-wicking fabric. Functional and fashionable.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Hot Pink', 'Turquoise'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('zip-front golf dress, modern sporty women fashion, golf course')}&aspect=3:4&seed=9404`,
  },
  {
    id: 'g6', name: 'Golf Vest & Shorts', category: 'Golf Days', price: 460,
    description: 'Casual golf vest paired with tailored shorts. Perfect for relaxed corporate golf outings.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Khaki', 'Sage'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('golf vest and tailored shorts set, casual corporate golf outing')}&aspect=3:4&seed=9405`,
  },
  {
    id: 'g7', name: 'Striped Golf Midi', category: 'Golf Days', price: 540,
    description: 'Preppy striped midi dress with collar detail. Classic country club aesthetic.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy/White', 'Green/White', 'Pink/White'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('striped midi dress with collar, preppy country club golf fashion')}&aspect=3:4&seed=9406`,
  },
  {
    id: 'g8', name: 'Performance Golf Skirt Set', category: 'Golf Days', price: 490,
    description: 'High-performance moisture-wicking top and tennis-style skirt set with built-in shorts.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Coral', 'Mint'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('performance golf skirt and top set, athletic women golf fashion')}&aspect=3:4&seed=9407`,
  },
  {
    id: 'g9', name: 'Golf Caddy Romper', category: 'Golf Days', price: 470,
    description: 'Cute caddy-style romper with utility pockets. Fun and functional for course activations.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Khaki', 'Light Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('caddy-style romper, women golf utility outfit, cute and functional')}&aspect=3:4&seed=9408`,
  },
  {
    id: 'g10', name: 'Elegant Golf Cardigan Set', category: 'Golf Days', price: 620,
    description: 'Lightweight cardigan over a fitted dress for early-morning tee-offs. Layers beautifully.',
    sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Cream', 'Blush', 'Navy'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('elegant golf cardigan and dress set, early morning golf fashion, layered')}&aspect=3:4&seed=9409`,
  },

  // ── Activations (10) ──
  {
    id: 'a1', name: 'Activation Jumpsuit', category: 'Activations', price: 620,
    description: 'Versatile branded jumpsuit for activations and outdoor events. Maximum branding space.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('stylish women jumpsuit, brand activation fashion, modern promotional')}&aspect=3:4&seed=9009`,
  },
  {
    id: 'a2', name: 'Brand Ambassador Dress', category: 'Activations', price: 580,
    description: 'Sleek fitted dress with large branding zones front and back. The go-to for brand ambassador teams.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Red', 'Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sleek fitted dress, brand ambassador outfit, clean branding zones')}&aspect=3:4&seed=9501`,
  },
  {
    id: 'a3', name: 'Activation Cargo Pants Set', category: 'Activations', price: 540,
    description: 'Crop top and cargo pants combo. Urban-cool look for street activations and pop-up events.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Khaki', 'White', 'Olive'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('crop top and cargo pants, urban street activation outfit, cool')}&aspect=3:4&seed=9502`,
  },
  {
    id: 'a4', name: 'Experiential Bodycon', category: 'Activations', price: 500,
    description: 'Bold bodycon dress for experiential marketing events. Sculpted fit with stretch comfort.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'White', 'Electric Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('bold bodycon dress, experiential marketing event outfit, vibrant')}&aspect=3:4&seed=9503`,
  },
  {
    id: 'a5', name: 'Tradeshow Blazer Set', category: 'Activations', price: 700,
    description: 'Cropped blazer and wide-leg trouser set. Professional yet stylish for trade shows.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Navy', 'Grey'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('cropped blazer and wide-leg trousers, tradeshow professional outfit')}&aspect=3:4&seed=9504`,
  },
  {
    id: 'a6', name: 'Pop-Up Dungaree', category: 'Activations', price: 440,
    description: 'Fun branded dungaree with a fitted tee. Playful and approachable for sampling campaigns.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Denim', 'White', 'Black', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('branded dungaree and tee, sampling campaign pop-up outfit, playful')}&aspect=3:4&seed=9505`,
  },
  {
    id: 'a7', name: 'LED Panel Dress', category: 'Activations', price: 1200,
    description: 'Innovative dress with integrated LED panels for digital branding. Showstopper at tech activations.',
    sizes: ['S', 'M', 'L'], colors: ['Black', 'White'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('futuristic LED panel dress, tech activation fashion, glowing digital')}&aspect=3:4&seed=9506`,
  },
  {
    id: 'a8', name: 'Sports Activation Tank Set', category: 'Activations', price: 400,
    description: 'Athletic tank top and track pants set. Built for sport sponsorship and fitness activations.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Neon Green', 'Red'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('athletic tank top and track pants, sports activation outfit, energetic')}&aspect=3:4&seed=9507`,
  },
  {
    id: 'a9', name: 'Activation Windbreaker Set', category: 'Activations', price: 520,
    description: 'Lightweight branded windbreaker and shorts. Weather-ready for outdoor activations.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Yellow', 'Blue'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('branded windbreaker and shorts, outdoor activation outfit, weather-ready')}&aspect=3:4&seed=9508`,
  },
  {
    id: 'a10', name: 'Branded Maxi Wrap', category: 'Activations', price: 650,
    description: 'Flowing maxi wrap dress with brandable sash. Elegant choice for luxury brand activations.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Champagne', 'Dusty Rose'], brandable: true, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('flowing maxi wrap dress with sash, luxury brand activation, elegant')}&aspect=3:4&seed=9509`,
  },

  // ── Fashion Shows (10) ──
  {
    id: 'f1', name: 'Runway Silk Dress', category: 'Fashion Shows', price: 1800,
    description: 'Luxurious silk midi dress designed for fashion show appearances. Elegant draping with modern silhouette.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Champagne', 'Emerald', 'Midnight Blue'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('luxurious silk midi dress, high fashion runway style, elegant draping')}&aspect=3:4&seed=9010`,
  },
  {
    id: 'f2', name: 'Avant-Garde Asymmetric', category: 'Fashion Shows', price: 2200,
    description: 'Bold asymmetric design with sculptural elements. Statement piece for runway presentations.',
    sizes: ['XS', 'S', 'M'], colors: ['Black', 'White', 'Crimson'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('avant-garde asymmetric dress, sculptural fashion, runway presentation')}&aspect=3:4&seed=9601`,
  },
  {
    id: 'f3', name: 'Sheer Overlay Gown', category: 'Fashion Shows', price: 2600,
    description: 'Ethereal sheer overlay gown with delicate embroidery. High fashion drama for the catwalk.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Ivory', 'Black', 'Blush'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('sheer overlay gown, delicate embroidery, high fashion catwalk, ethereal')}&aspect=3:4&seed=9602`,
  },
  {
    id: 'f4', name: 'Structured Origami Dress', category: 'Fashion Shows', price: 2400,
    description: 'Architectural origami-inspired design with crisp folds. A sculptural masterpiece for the runway.',
    sizes: ['S', 'M', 'L'], colors: ['White', 'Black', 'Red'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('origami structured dress, architectural fashion design, crisp folds, runway')}&aspect=3:4&seed=9603`,
  },
  {
    id: 'f5', name: 'Couture Feather Gown', category: 'Fashion Shows', price: 3500,
    description: 'Opulent feather-adorned gown. Full couture impact for finale walks and show closers.',
    sizes: ['XS', 'S', 'M'], colors: ['White', 'Black', 'Pastel Pink'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('couture feather gown, opulent fashion show finale, luxury catwalk')}&aspect=3:4&seed=9604`,
  },
  {
    id: 'f6', name: 'Deconstructed Tailoring', category: 'Fashion Shows', price: 1950,
    description: 'Deconstructed tailored jacket and asymmetric skirt. Contemporary edge for editorial shows.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Charcoal', 'Camel'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('deconstructed tailored jacket and skirt, editorial fashion show, contemporary')}&aspect=3:4&seed=9605`,
  },
  {
    id: 'f7', name: 'Holographic Mini', category: 'Fashion Shows', price: 1600,
    description: 'Futuristic holographic mini dress that shifts color with movement. Cutting-edge runway fashion.',
    sizes: ['XS', 'S', 'M'], colors: ['Holographic Silver', 'Holographic Pink'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('holographic mini dress, futuristic fashion show, iridescent color-shifting')}&aspect=3:4&seed=9606`,
  },
  {
    id: 'f8', name: 'Pleated Palazzo Set', category: 'Fashion Shows', price: 1750,
    description: 'Dramatic pleated palazzo pants with matching bandeau top. Fluid movement perfection on the catwalk.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Emerald', 'Cobalt', 'Terracotta', 'Ivory'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('pleated palazzo pants and bandeau top, dramatic fluid fashion show')}&aspect=3:4&seed=9607`,
  },
  {
    id: 'f9', name: 'Chain Mail Dress', category: 'Fashion Shows', price: 2800,
    description: 'Metallic chain mail dress inspired by medieval armor. Unforgettable statement for avant-garde shows.',
    sizes: ['S', 'M', 'L'], colors: ['Silver', 'Gold', 'Gunmetal'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('metallic chain mail dress, avant-garde medieval inspired fashion, dramatic')}&aspect=3:4&seed=9608`,
  },
  {
    id: 'f10', name: 'Cape Train Gown', category: 'Fashion Shows', price: 3200,
    description: 'Floor-length gown with dramatic cape train. The ultimate show-closing statement piece.',
    sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'Royal Purple', 'White'], brandable: false, inStock: true,
    image: `${IMG}?text=${encodeURIComponent('floor-length gown with dramatic cape train, fashion show finale, regal')}&aspect=3:4&seed=9609`,
  },
];

function DemoOutfitsScreen() {
  const [activeCat, setActiveCat] = useState('All');
  const [detail, setDetail] = useState<any>(null);
  const [selSize, setSelSize] = useState('');
  const [selColor, setSelColor] = useState('');
  const [qty, setQty] = useState('1');

  const filtered = activeCat === 'All' ? DEMO_OUTFITS : DEMO_OUTFITS.filter(o => o.category === activeCat);
  const cols = width > 400 ? 2 : 2;
  const cardW = (width - 48 - 10) / cols;

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={s.h1}>Outfits Shop</Text>
        <Text style={{ color: C.sub, fontSize: 13, marginTop: 2, marginBottom: 10 }}>
          {filtered.length} outfits available
        </Text>
      </View>

      {/* Category Tabs */}
      <View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {OUTFIT_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: activeCat === cat ? C.gold : C.cardLight,
                borderWidth: 1, borderColor: activeCat === cat ? C.gold : C.border,
              }}
              onPress={() => setActiveCat(cat)}
            >
              <Text style={{ color: activeCat === cat ? C.black : C.sub, fontSize: 13, fontWeight: '600' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Outfit Grid */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={cols}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: cardW, backgroundColor: C.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}
            onPress={() => { setDetail(item); setSelSize(''); setSelColor(''); setQty('1'); }}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.image }} style={{ width: cardW, height: cardW * 1.3, resizeMode: 'cover' }} />
            <View style={{ padding: 10 }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{item.category}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <Text style={{ color: C.gold, fontWeight: '800', fontSize: 15 }}>R{item.price}</Text>
                {item.brandable && (
                  <View style={{ backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ color: C.gold, fontSize: 9, fontWeight: '600' }}>BRANDABLE</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!detail} animationType="slide" transparent>
        {detail && (
          <View style={s.modalBg}>
            <View style={s.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Image source={{ uri: detail.image }} style={{ width: '100%', height: 320, borderRadius: 14 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.h1}>{detail.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <View style={{ backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                        <Text style={{ color: C.gold, fontSize: 11, fontWeight: '600' }}>{detail.category}</Text>
                      </View>
                      {detail.brandable && (
                        <View style={{ backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                          <Text style={{ color: C.green, fontSize: 11, fontWeight: '600' }}>Brandable</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={{ color: C.gold, fontWeight: '800', fontSize: 22 }}>R{detail.price}</Text>
                </View>

                <Text style={{ color: C.sub, fontSize: 13, lineHeight: 19, marginTop: 10 }}>{detail.description}</Text>

                <Text style={[s.h2, { marginTop: 16 }]}>Size</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {detail.sizes.map((sz: string) => (
                    <TouchableOpacity
                      key={sz}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: selSize === sz ? C.gold : C.cardLight,
                        borderWidth: 1, borderColor: selSize === sz ? C.gold : C.border,
                      }}
                      onPress={() => setSelSize(sz)}
                    >
                      <Text style={{ color: selSize === sz ? C.black : C.text, fontWeight: '600', fontSize: 13 }}>{sz}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[s.h2, { marginTop: 14 }]}>Color</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {detail.colors.map((clr: string) => (
                    <TouchableOpacity
                      key={clr}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: selColor === clr ? C.gold : C.cardLight,
                        borderWidth: 1, borderColor: selColor === clr ? C.gold : C.border,
                      }}
                      onPress={() => setSelColor(clr)}
                    >
                      <Text style={{ color: selColor === clr ? C.black : C.text, fontWeight: '600', fontSize: 13 }}>{clr}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[s.h2, { marginTop: 14 }]}>Quantity</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
                    onPress={() => setQty(String(Math.max(1, parseInt(qty || '1') - 1)))}
                  >
                    <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' }}>{qty}</Text>
                  <TouchableOpacity
                    style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.cardLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }}
                    onPress={() => setQty(String(parseInt(qty || '1') + 1))}
                  >
                    <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>+</Text>
                  </TouchableOpacity>
                  <Text style={{ color: C.sub, fontSize: 13, marginLeft: 8 }}>
                    Total: <Text style={{ color: C.gold, fontWeight: '700' }}>R{detail.price * parseInt(qty || '1')}</Text>
                  </Text>
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[s.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 0 }]}
                  onPress={() => {
                    if (!selSize || !selColor) {
                      Alert.alert('Select Options', 'Please choose a size and color before ordering.');
                      return;
                    }
                    Alert.alert(
                      'Order Submitted!',
                      `${qty}x ${detail.name} (${selSize}, ${selColor}) - R${detail.price * parseInt(qty)} total.\n\nDiamond Angels will confirm your order within 24 hours.`,
                      [{ text: 'OK', onPress: () => setDetail(null) }]
                    );
                  }}
                >
                  <Ionicons name="cart" size={18} color={C.black} />
                  <Text style={s.goldBtnText}>Order Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight, marginTop: 0 }]} onPress={() => setDetail(null)}>
                  <Text style={{ color: C.sub, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

// ======= ADMIN SCREENS =======
function AdminDash() {
  const pending = TALENT.filter(t => t.status === 'pending');
  const approved = TALENT.filter(t => t.status === 'approved');
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16 }}>
        <Text style={s.h1}>Dashboard</Text>
        <View style={s.statsRow}>
          <View style={s.statCard}><Text style={s.statNum}>{pending.length}</Text><Text style={s.statLabel}>Pending</Text></View>
          <View style={s.statCard}><Text style={s.statNum}>{approved.length}</Text><Text style={s.statLabel}>Approved</Text></View>
          <View style={s.statCard}><Text style={s.statNum}>{BOOKINGS.filter(b=>b.status==='pending').length}</Text><Text style={s.statLabel}>New Bookings</Text></View>
          <View style={s.statCard}><Text style={s.statNum}>{GIGS.length}</Text><Text style={s.statLabel}>Open Gigs</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminTalent() {
  const [talentList, setTalentList] = useState([...TALENT]);
  const [detail, setDetail] = useState<any>(null);
  const [editModal, setEditModal] = useState(false);

  // Edit fields
  const [eFirstName, setEFirstName] = useState('');
  const [eLastName, setELastName] = useState('');
  const [eCity, setECity] = useState('');
  const [eArea, setEArea] = useState('');
  const [eRace, setERace] = useState('');
  const [eBodyType, setEBodyType] = useState('');
  const [eHeight, setEHeight] = useState('');
  const [eBg, setEBg] = useState('');
  const [eQualifications, setEQualifications] = useState('');
  const [eWorkExp, setEWorkExp] = useState('');
  const [eAvailability, setEAvailability] = useState('');
  const [eCategories, setECategories] = useState<Set<string>>(new Set());
  const [eSkills, setESkills] = useState('');

  const RACE_OPTS = ['Black', 'White', 'Coloured', 'Indian', 'Asian', 'Other'];
  const BODY_OPTS = ['Slim', 'Athletic', 'Curvy', 'Petite', 'Plus Size'];
  const CAT_OPTS = ['Model', 'Hostess', 'Promoter', 'Brand Ambassador', 'Bottle Girl', 'Ambience', 'Actress', 'Dancer'];

  const openEdit = (t: any) => {
    setEFirstName(t.firstName); setELastName(t.lastName);
    setECity(t.city); setEArea(t.area);
    setERace(t.race); setEBodyType(t.bodyType);
    setEHeight(String(t.heightCm)); setEBg(t.background);
    setEQualifications(t.qualifications); setEWorkExp(t.workExperience);
    setEAvailability(t.availability); setECategories(new Set(t.categories));
    setESkills(t.skills.join(', '));
    setEditModal(true);
  };

  const saveEdit = () => {
    if (!detail) return;
    const updated = {
      ...detail,
      firstName: eFirstName, lastName: eLastName, city: eCity, area: eArea,
      race: eRace, bodyType: eBodyType, heightCm: parseInt(eHeight) || detail.heightCm,
      background: eBg, qualifications: eQualifications, workExperience: eWorkExp,
      availability: eAvailability, categories: Array.from(eCategories),
      skills: eSkills.split(',').map((sk: string) => sk.trim()).filter(Boolean),
    };
    setTalentList(prev => prev.map(t => t.id === detail.id ? updated : t));
    setDetail(updated);
    setEditModal(false);
    Alert.alert('Saved', `${eFirstName} ${eLastName}'s profile updated.`);
  };

  const toggleCat = (cat: string) => {
    const next = new Set(eCategories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setECategories(next);
  };

  return (
    <SafeAreaView style={s.safe}>
      <Text style={[s.h1, { padding: 16, paddingBottom: 8 }]}>Talent Management</Text>
      <FlatList
        data={talentList}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.talentCard} onPress={() => setDetail(item)}>
            <Image source={{ uri: item.photos[0] }} style={s.talentThumb} />
            <View style={{ flex: 1 }}>
              <Text style={s.listTitle}>{item.firstName} {item.lastName}</Text>
              <Text style={s.listSub}>{item.city}, {item.area} · {item.heightCm}cm</Text>
              <Text style={s.listSub}>{item.categories.join(', ')}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
              <Text style={[s.badgeText, { color: C.green }]}>Approved</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!detail && !editModal} animationType="slide" transparent>
        {detail && (
          <View style={s.modalBg}>
            <View style={s.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <PhotoSlider photos={detail.photos} />
                <Text style={[s.h1, { marginTop: 16 }]}>{detail.firstName} {detail.lastName}</Text>
                <Text style={s.listSub}>{detail.city}, {detail.area} · {detail.race} · {detail.bodyType} · {detail.heightCm}cm</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {detail.categories.map((c: string, i: number) => <View key={i} style={sty.chip}><Text style={sty.chipText}>{c}</Text></View>)}
                </View>
                <Text style={[s.h2, { marginTop: 16 }]}>Background</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{detail.background}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Qualifications</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{detail.qualifications}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Skills</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {detail.skills.map((sk: string, i: number) => <View key={i} style={[sty.chip, { backgroundColor: 'rgba(139,92,246,0.12)' }]}><Text style={[sty.chipText, { color: '#A78BFA' }]}>{sk}</Text></View>)}
                </View>
                <Text style={[s.h2, { marginTop: 12 }]}>Work Experience</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{detail.workExperience}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Availability</Text>
                <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{detail.availability}</Text>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12 }}
                    onPress={() => openEdit(detail)}
                  >
                    <Ionicons name="create-outline" size={18} color={C.black} />
                    <Text style={{ color: C.black, fontWeight: '700', fontSize: 15 }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.red, paddingVertical: 14, borderRadius: 12 }}
                    onPress={() => Alert.alert('Delete Profile', `Are you sure you want to delete ${detail.firstName} ${detail.lastName}?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { setTalentList(prev => prev.filter(t => t.id !== detail.id)); setDetail(null); } }])}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              <TouchableOpacity style={s.goldBtn} onPress={() => setDetail(null)}>
                <Text style={s.goldBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={s.modalBg}>
          <View style={[s.modalContent, { maxHeight: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text style={{ color: C.sub, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 18 }}>Edit Profile</Text>
              <TouchableOpacity onPress={saveEdit}>
                <Text style={{ color: C.gold, fontSize: 16, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>First Name</Text>
                  <TextInput style={demoEditInput} value={eFirstName} onChangeText={setEFirstName} placeholderTextColor={C.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Last Name</Text>
                  <TextInput style={demoEditInput} value={eLastName} onChangeText={setELastName} placeholderTextColor={C.muted} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>City</Text>
                  <TextInput style={demoEditInput} value={eCity} onChangeText={setECity} placeholderTextColor={C.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Area</Text>
                  <TextInput style={demoEditInput} value={eArea} onChangeText={setEArea} placeholderTextColor={C.muted} />
                </View>
              </View>
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Height (cm)</Text>
              <TextInput style={[demoEditInput, { marginBottom: 14 }]} value={eHeight} onChangeText={setEHeight} keyboardType="numeric" placeholderTextColor={C.muted} />

              <Text style={{ color: '#A78BFA', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Race</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {RACE_OPTS.map(r => (
                  <TouchableOpacity key={r} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eRace === r ? '#A78BFA' : C.cardLight, borderWidth: 1, borderColor: eRace === r ? '#A78BFA' : C.border }} onPress={() => setERace(r)}>
                    <Text style={{ color: eRace === r ? C.black : C.text, fontSize: 13, fontWeight: '600' }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: '#2DD4BF', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Body Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {BODY_OPTS.map(b => (
                  <TouchableOpacity key={b} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eBodyType === b ? '#2DD4BF' : C.cardLight, borderWidth: 1, borderColor: eBodyType === b ? '#2DD4BF' : C.border }} onPress={() => setEBodyType(b)}>
                    <Text style={{ color: eBodyType === b ? C.black : C.text, fontSize: 13, fontWeight: '600' }}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: C.gold, fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Categories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {CAT_OPTS.map(c => (
                  <TouchableOpacity key={c} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eCategories.has(c) ? C.gold : C.cardLight, borderWidth: 1, borderColor: eCategories.has(c) ? C.gold : C.border }} onPress={() => toggleCat(c)}>
                    <Text style={{ color: eCategories.has(c) ? C.black : C.text, fontSize: 13, fontWeight: '600' }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Background / About</Text>
              <TextInput style={[demoEditInput, { minHeight: 80, textAlignVertical: 'top', marginBottom: 14 }]} value={eBg} onChangeText={setEBg} multiline placeholderTextColor={C.muted} />
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Qualifications</Text>
              <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top', marginBottom: 14 }]} value={eQualifications} onChangeText={setEQualifications} multiline placeholderTextColor={C.muted} />
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Skills (comma separated)</Text>
              <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top', marginBottom: 14 }]} value={eSkills} onChangeText={setESkills} multiline placeholderTextColor={C.muted} />
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Work Experience</Text>
              <TextInput style={[demoEditInput, { minHeight: 80, textAlignVertical: 'top', marginBottom: 14 }]} value={eWorkExp} onChangeText={setEWorkExp} multiline placeholderTextColor={C.muted} />
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Availability</Text>
              <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top', marginBottom: 14 }]} value={eAvailability} onChangeText={setEAvailability} multiline placeholderTextColor={C.muted} />

              <TouchableOpacity style={{ backgroundColor: C.gold, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 }} onPress={saveEdit}>
                <Text style={{ color: C.black, fontWeight: '800', fontSize: 16 }}>Save Changes</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AdminBookings() {
  return (
    <SafeAreaView style={s.safe}>
      <Text style={[s.h1, { padding: 16, paddingBottom: 8 }]}>Booking Requests</Text>
      <FlatList data={BOOKINGS} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16, paddingTop: 0 }} renderItem={({ item }) => (
        <View style={s.listCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{item.company}</Text>
            <Text style={s.listSub}>{item.type} · {item.date}</Text>
            <Text style={s.listSub}>{item.city}, {item.venue} · {item.count} talent</Text>
          </View>
          <View style={[s.badge, { backgroundColor: item.status==='confirmed'?'rgba(16,185,129,0.15)':item.status==='pending'?'rgba(245,158,11,0.15)':'rgba(139,92,246,0.15)' }]}>
            <Text style={[s.badgeText,{color:item.status==='confirmed'?C.green:item.status==='pending'?C.warn:'#8B5CF6'}]}>{item.status}</Text>
          </View>
        </View>
      )} />
    </SafeAreaView>
  );
}

function AdminGigs() {
  return (
    <SafeAreaView style={s.safe}>
      <Text style={[s.h1, { padding: 16, paddingBottom: 8 }]}>Gig Management</Text>
      <FlatList data={GIGS} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16, paddingTop: 0 }} renderItem={({ item }) => (
        <View style={s.listCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{item.title}</Text>
            <Text style={s.listSub}>{item.type} · {item.city} · {item.date}</Text>
            <Text style={s.listSub}>{item.needed} needed · {item.comp}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: C.gold, fontWeight: '700', fontSize: 18 }}>{item.interests}</Text>
            <Text style={{ color: C.sub, fontSize: 11 }}>interests</Text>
          </View>
        </View>
      )} />
    </SafeAreaView>
  );
}

// ======= CLIENT SCREENS =======
function ClientSearch() {
  const approved = TALENT.filter(t => t.status === 'approved');
  const [detail, setDetail] = useState<any>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [filterRace, setFilterRace] = useState('');
  const [filterBody, setFilterBody] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterMinH, setFilterMinH] = useState(0);
  const [filterMaxH, setFilterMaxH] = useState(200);
  const [bookEventType, setBookEventType] = useState('');
  const [bookNotes, setBookNotes] = useState('');

  const cities = [...new Set(approved.map(t => t.city))].sort();
  const races = [...new Set(approved.map(t => t.race))].sort();
  const bodies = [...new Set(approved.map(t => t.bodyType))].sort();
  const cats = [...new Set(approved.flatMap(t => t.categories))].sort();

  const filtered = approved.filter(t => {
    if (filterCity && t.city !== filterCity) return false;
    if (filterRace && t.race !== filterRace) return false;
    if (filterBody && t.bodyType !== filterBody) return false;
    if (filterCat && !t.categories.includes(filterCat)) return false;
    if (t.heightCm < filterMinH || t.heightCm > filterMaxH) return false;
    return true;
  });

  const activeFilterCount = [filterCity, filterRace, filterBody, filterCat, filterMinH > 0 ? 'h' : '', filterMaxH < 200 ? 'h' : ''].filter(Boolean).length;

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const clearFilters = () => {
    setFilterCity(''); setFilterRace(''); setFilterBody(''); setFilterCat('');
    setFilterMinH(0); setFilterMaxH(200);
  };

  const cols = width > 400 ? 3 : 2;
  const cardW = (width - 48 - (cols - 1) * 10) / cols;

  return (
    <SafeAreaView style={s.safe}>
      {/* Fixed Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={s.h1}>Search Talent</Text>
        <Text style={{ color: C.sub, fontSize: 13, marginTop: 2, marginBottom: 10 }}>
          {filtered.length} of {approved.length} talent available
        </Text>
      </View>

      {/* Filter Bar - Fixed above grid */}
      <View style={{ paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
          {/* Main Filter Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22,
              backgroundColor: activeFilterCount > 0 ? C.gold : 'transparent',
              borderWidth: 1.5, borderColor: C.gold,
            }}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={16} color={activeFilterCount > 0 ? C.black : C.gold} />
            <Text style={{ color: activeFilterCount > 0 ? C.black : C.gold, fontSize: 14, fontWeight: '700' }}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Quick filter chips */}
          {cities.map(c => (
            <TouchableOpacity
              key={c}
              style={{
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18,
                backgroundColor: filterCity === c ? C.gold : C.cardLight,
                borderWidth: 1, borderColor: filterCity === c ? C.gold : C.border,
              }}
              onPress={() => setFilterCity(filterCity === c ? '' : c)}
            >
              <Text style={{ color: filterCity === c ? C.black : C.sub, fontSize: 12, fontWeight: '600' }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, marginTop: 8 }}>
            {filterRace ? (
              <TouchableOpacity style={fStyles.activeTag} onPress={() => setFilterRace('')}>
                <Text style={fStyles.activeTagText}>{filterRace}</Text>
                <Ionicons name="close" size={12} color={C.gold} />
              </TouchableOpacity>
            ) : null}
            {filterBody ? (
              <TouchableOpacity style={fStyles.activeTag} onPress={() => setFilterBody('')}>
                <Text style={fStyles.activeTagText}>{filterBody}</Text>
                <Ionicons name="close" size={12} color={C.gold} />
              </TouchableOpacity>
            ) : null}
            {filterCat ? (
              <TouchableOpacity style={fStyles.activeTag} onPress={() => setFilterCat('')}>
                <Text style={fStyles.activeTagText}>{filterCat}</Text>
                <Ionicons name="close" size={12} color={C.gold} />
              </TouchableOpacity>
            ) : null}
            {(filterMinH > 0 || filterMaxH < 200) ? (
              <TouchableOpacity style={fStyles.activeTag} onPress={() => { setFilterMinH(0); setFilterMaxH(200); }}>
                <Text style={fStyles.activeTagText}>{filterMinH || 155}-{filterMaxH < 200 ? filterMaxH : '185+'}cm</Text>
                <Ionicons name="close" size={12} color={C.gold} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={clearFilters} style={{ justifyContent: 'center', paddingHorizontal: 8 }}>
              <Text style={{ color: C.red, fontSize: 12, fontWeight: '600' }}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Talent Grid */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={cols}
        contentContainerStyle={{ padding: 16, paddingBottom: selected.size > 0 ? 80 : 16 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const isSel = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[s.gridCard, { width: cardW, marginBottom: 10 }, isSel && { borderWidth: 2, borderColor: C.gold }]}
              onPress={() => setDetail(item)}
              onLongPress={() => toggleSelect(item.id)}
            >
              <Image source={{ uri: item.photos[0] }} style={[s.gridImg, { width: cardW - (isSel ? 4 : 0), height: cardW * 1.3 }]} />
              <TouchableOpacity
                style={[fStyles.checkbox, isSel && fStyles.checkboxActive]}
                onPress={() => toggleSelect(item.id)}
              >
                {isSel && <Ionicons name="checkmark" size={14} color={C.black} />}
              </TouchableOpacity>
              <View style={{ padding: 8 }}>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
                <Text style={{ color: C.sub, fontSize: 11 }}>{item.city} · {item.heightCm}cm</Text>
                <Text style={{ color: C.muted, fontSize: 10 }}>{item.categories[0]}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="search" size={48} color={C.muted} />
            <Text style={{ color: C.sub, fontSize: 15, marginTop: 12 }}>No talent matches your filters</Text>
            <TouchableOpacity onPress={clearFilters} style={{ marginTop: 12 }}>
              <Text style={{ color: C.gold, fontWeight: '600' }}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Selection Bar */}
      {selected.size > 0 && (
        <View style={fStyles.selectionBar}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 15 }}>{selected.size} talent selected</Text>
            <TouchableOpacity onPress={() => setSelected(new Set())}>
              <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>Clear selection</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={fStyles.submitBtn} onPress={() => setShowBookingForm(true)}>
            <Ionicons name="send" size={16} color={C.black} />
            <Text style={{ color: C.black, fontWeight: '700', fontSize: 14 }}>Submit Selection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={s.modalBg}>
          <View style={[s.modalContent, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 20 }}>Filter Talent</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={{ color: C.gold, fontSize: 14, fontWeight: '600' }}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={fStyles.filterLabel}>City</Text>
              <View style={fStyles.optionRow}>
                <TouchableOpacity style={[fStyles.optionChip, !filterCity && fStyles.optionChipActive]} onPress={() => setFilterCity('')}>
                  <Text style={[fStyles.optionText, !filterCity && { color: C.black }]}>All</Text>
                </TouchableOpacity>
                {cities.map(c => (
                  <TouchableOpacity key={c} style={[fStyles.optionChip, filterCity === c && fStyles.optionChipActive]} onPress={() => setFilterCity(filterCity === c ? '' : c)}>
                    <Text style={[fStyles.optionText, filterCity === c && { color: C.black }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={fStyles.filterLabel}>Race</Text>
              <View style={fStyles.optionRow}>
                <TouchableOpacity style={[fStyles.optionChip, !filterRace && fStyles.optionChipActive]} onPress={() => setFilterRace('')}>
                  <Text style={[fStyles.optionText, !filterRace && { color: C.black }]}>All</Text>
                </TouchableOpacity>
                {races.map(r => (
                  <TouchableOpacity key={r} style={[fStyles.optionChip, filterRace === r && fStyles.optionChipActive]} onPress={() => setFilterRace(filterRace === r ? '' : r)}>
                    <Text style={[fStyles.optionText, filterRace === r && { color: C.black }]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={fStyles.filterLabel}>Body Type</Text>
              <View style={fStyles.optionRow}>
                <TouchableOpacity style={[fStyles.optionChip, !filterBody && fStyles.optionChipActive]} onPress={() => setFilterBody('')}>
                  <Text style={[fStyles.optionText, !filterBody && { color: C.black }]}>All</Text>
                </TouchableOpacity>
                {bodies.map(b => (
                  <TouchableOpacity key={b} style={[fStyles.optionChip, filterBody === b && fStyles.optionChipActive]} onPress={() => setFilterBody(filterBody === b ? '' : b)}>
                    <Text style={[fStyles.optionText, filterBody === b && { color: C.black }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={fStyles.filterLabel}>Category</Text>
              <View style={fStyles.optionRow}>
                <TouchableOpacity style={[fStyles.optionChip, !filterCat && fStyles.optionChipActive]} onPress={() => setFilterCat('')}>
                  <Text style={[fStyles.optionText, !filterCat && { color: C.black }]}>All</Text>
                </TouchableOpacity>
                {cats.map(c => (
                  <TouchableOpacity key={c} style={[fStyles.optionChip, filterCat === c && fStyles.optionChipActive]} onPress={() => setFilterCat(filterCat === c ? '' : c)}>
                    <Text style={[fStyles.optionText, filterCat === c && { color: C.black }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={fStyles.filterLabel}>Height Range (cm)</Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <View style={fStyles.heightInput}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Min</Text>
                  {[155, 160, 165, 170, 175].map(h => (
                    <TouchableOpacity key={h} style={[fStyles.hChip, filterMinH === h && fStyles.hChipActive]} onPress={() => setFilterMinH(filterMinH === h ? 0 : h)}>
                      <Text style={[fStyles.hChipText, filterMinH === h && { color: C.black }]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ color: C.muted }}>—</Text>
                <View style={fStyles.heightInput}>
                  <Text style={{ color: C.sub, fontSize: 11 }}>Max</Text>
                  {[165, 170, 175, 180, 185].map(h => (
                    <TouchableOpacity key={h} style={[fStyles.hChip, filterMaxH === h && fStyles.hChipActive]} onPress={() => setFilterMaxH(filterMaxH === h ? 200 : h)}>
                      <Text style={[fStyles.hChipText, filterMaxH === h && { color: C.black }]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={s.goldBtn} onPress={() => setShowFilters(false)}>
              <Text style={s.goldBtnText}>Show {filtered.length} Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Talent Detail Modal */}
      <Modal visible={!!detail} animationType="slide" transparent>
        {detail && (
          <View style={s.modalBg}>
            <View style={s.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <PhotoSlider photos={detail.photos} />
                <Text style={[s.h1, { marginTop: 16 }]}>{detail.firstName} {detail.lastName}</Text>
                <Text style={s.listSub}>{detail.city}, {detail.area} · {detail.race} · {detail.bodyType} · {detail.heightCm}cm</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {detail.categories.map((c: string, i: number) => <View key={i} style={sty.chip}><Text style={sty.chipText}>{c}</Text></View>)}
                </View>
                <Text style={[s.h2, { marginTop: 16 }]}>Background</Text>
                <Text style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>{detail.background}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Qualifications</Text>
                <Text style={{ color: C.text, fontSize: 13 }}>{detail.qualifications}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Skills</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {detail.skills.map((sk: string, i: number) => <View key={i} style={[sty.chip, { backgroundColor: 'rgba(139,92,246,0.12)' }]}><Text style={[sty.chipText, { color: '#A78BFA' }]}>{sk}</Text></View>)}
                </View>
                <Text style={[s.h2, { marginTop: 12 }]}>Hobbies</Text>
                <Text style={{ color: C.text, fontSize: 13 }}>{detail.hobbies.join(' · ')}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Work Experience</Text>
                <Text style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>{detail.workExperience}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Availability</Text>
                <Text style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>{detail.availability}</Text>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[s.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: selected.has(detail.id) ? C.green : C.gold }]}
                  onPress={() => { toggleSelect(detail.id); }}
                >
                  <Ionicons name={selected.has(detail.id) ? 'checkmark-circle' : 'add-circle'} size={18} color={C.black} />
                  <Text style={s.goldBtnText}>{selected.has(detail.id) ? 'Selected' : 'Select Talent'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight }]} onPress={() => setDetail(null)}>
                  <Text style={{ color: C.sub, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Booking Form Modal */}
      <Modal visible={showBookingForm} animationType="slide" transparent>
        <View style={s.modalBg}>
          <View style={[s.modalContent, { maxHeight: '75%' }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 20, marginBottom: 4 }}>Submit Selection</Text>
              <Text style={{ color: C.sub, fontSize: 13, marginBottom: 16 }}>{selected.size} talent selected for your event</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {TALENT.filter(t => selected.has(t.id)).map(t => (
                  <View key={t.id} style={{ alignItems: 'center', marginRight: 12 }}>
                    <Image source={{ uri: t.photos[0] }} style={{ width: 50, height: 65, borderRadius: 8, borderWidth: 2, borderColor: C.gold }} />
                    <Text style={{ color: C.text, fontSize: 10, marginTop: 4, maxWidth: 56, textAlign: 'center' }} numberOfLines={1}>{t.firstName}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={fStyles.filterLabel}>Event Type</Text>
              <View style={fStyles.optionRow}>
                {['Brand Activation', 'Fashion Show', 'Music Festival', 'Corporate Event', 'Golf Day', 'Photoshoot', 'Product Launch', 'Conference', 'Club', 'Movie', 'TV Advert'].map(t => (
                  <TouchableOpacity key={t} style={[fStyles.optionChip, bookEventType === t && fStyles.optionChipActive]} onPress={() => setBookEventType(bookEventType === t ? '' : t)}>
                    <Text style={[fStyles.optionText, bookEventType === t && { color: C.black }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={fStyles.filterLabel}>Notes / Special Requirements</Text>
              <TextInput
                style={{ backgroundColor: C.cardLight, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, color: C.text, fontSize: 14, minHeight: 80, textAlignVertical: 'top' }}
                placeholder="Add details about your event, dress code, timing, special requirements..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={4}
                value={bookNotes}
                onChangeText={setBookNotes}
              />

              <View style={{ backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 14, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="information-circle" size={18} color={C.gold} />
                  <Text style={{ color: C.gold, fontWeight: '600', fontSize: 13 }}>How it works</Text>
                </View>
                <Text style={{ color: C.sub, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                  Once submitted, our team will review your selection and reach out to the chosen talent on your behalf. We'll confirm availability within 24-48 hours.
                </Text>
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}
                onPress={() => {
                  Alert.alert('Selection Submitted!', `Your selection of ${selected.size} talent has been sent to Diamond Angels. We'll confirm availability within 24-48 hours.`, [{ text: 'OK', onPress: () => { setShowBookingForm(false); setSelected(new Set()); } }]);
                }}
              >
                <Ionicons name="send" size={16} color={C.black} />
                <Text style={s.goldBtnText}>Submit to Agency</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight }]} onPress={() => setShowBookingForm(false)}>
                <Text style={{ color: C.sub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ClientBookings() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bookings, setBookings] = useState(BOOKINGS.slice(0, 3));
  const [detailTalent, setDetailTalent] = useState<any>(null);

  const getTalent = (id: string) => TALENT.find(t => t.id === id);

  const removeTalent = (bookingId: string, talentId: string) => {
    Alert.alert(
      'Remove Talent',
      `Remove ${getTalent(talentId)?.firstName} ${getTalent(talentId)?.lastName} from this selection?`,
      [
        { text: 'Cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: () => {
            setBookings(prev => prev.map(b =>
              b.id === bookingId
                ? { ...b, talentIds: b.talentIds.filter(t => t !== talentId), count: b.count - 1 }
                : b
            ));
          }
        }
      ]
    );
  };

  const statusColor = (st: string) => {
    if (st === 'confirmed') return C.green;
    if (st === 'pending') return C.warn;
    return '#8B5CF6';
  };

  const statusBg = (st: string) => {
    if (st === 'confirmed') return 'rgba(16,185,129,0.15)';
    if (st === 'pending') return 'rgba(245,158,11,0.15)';
    return 'rgba(139,92,246,0.15)';
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={s.h1}>My Selections</Text>
        <Text style={{ color: C.sub, fontSize: 13, marginTop: 2 }}>{bookings.length} active selections</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 }}
        renderItem={({ item }) => {
          const isExpanded = expanded === item.id;
          const talents = item.talentIds.map(getTalent).filter(Boolean);

          return (
            <View style={{ marginBottom: 12 }}>
              {/* Booking Header Card */}
              <TouchableOpacity
                style={[s.listCard, { marginBottom: 0, borderBottomLeftRadius: isExpanded ? 0 : 12, borderBottomRightRadius: isExpanded ? 0 : 12 }]}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={s.listTitle}>{item.type}</Text>
                    <View style={[s.badge, { backgroundColor: statusBg(item.status) }]}>
                      <Text style={[s.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={s.listSub}>{item.date} · {item.city}</Text>
                  <Text style={s.listSub}>{item.venue}</Text>

                  {/* Talent preview avatars */}
                  <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                    {talents.slice(0, 5).map((t: any, i: number) => (
                      <Image
                        key={t.id}
                        source={{ uri: t.photos[0] }}
                        style={{
                          width: 32, height: 32, borderRadius: 16,
                          borderWidth: 2, borderColor: C.card,
                          marginLeft: i > 0 ? -8 : 0,
                        }}
                      />
                    ))}
                    {talents.length > 5 && (
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.cardLight, marginLeft: -8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.card }}>
                        <Text style={{ color: C.gold, fontSize: 10, fontWeight: '700' }}>+{talents.length - 5}</Text>
                      </View>
                    )}
                    <Text style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>{item.talentIds.length} talent</Text>
                  </View>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
              </TouchableOpacity>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={{ backgroundColor: C.cardLight, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 14 }}>
                  {/* Notes */}
                  {item.notes ? (
                    <View style={{ backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Ionicons name="document-text-outline" size={14} color={C.gold} />
                        <Text style={{ color: C.gold, fontSize: 12, fontWeight: '600' }}>Notes</Text>
                      </View>
                      <Text style={{ color: C.sub, fontSize: 12, lineHeight: 18 }}>{item.notes}</Text>
                    </View>
                  ) : null}

                  {/* Selected Talent List */}
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 10 }}>Selected Talent ({item.talentIds.length})</Text>
                  {talents.map((t: any) => (
                    <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 10, padding: 10, marginBottom: 8, gap: 10 }}>
                      <TouchableOpacity onPress={() => setDetailTalent(t)}>
                        <Image source={{ uri: t.photos[0] }} style={{ width: 56, height: 72, borderRadius: 8 }} />
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => setDetailTalent(t)}>
                        <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }}>{t.firstName} {t.lastName}</Text>
                        <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{t.city}, {t.area} · {t.heightCm}cm</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {t.categories.slice(0, 2).map((c: string, i: number) => (
                            <View key={i} style={{ backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                              <Text style={{ color: C.gold, fontSize: 10 }}>{c}</Text>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ padding: 8 }}
                        onPress={() => removeTalent(item.id, t.id)}
                      >
                        <Ionicons name="close-circle" size={22} color={C.red} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add More Button */}
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderWidth: 1, borderColor: C.gold, borderRadius: 10, borderStyle: 'dashed', marginTop: 4 }}
                    onPress={() => Alert.alert('Add Talent', 'Go to Search tab to find and add more talent to this selection.', [{ text: 'OK' }])}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={C.gold} />
                    <Text style={{ color: C.gold, fontWeight: '600', fontSize: 13 }}>Add More Talent</Text>
                  </TouchableOpacity>

                  {/* Status Actions */}
                  {item.status === 'pending' && (
                    <View style={{ marginTop: 12, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="time-outline" size={16} color={C.warn} />
                        <Text style={{ color: C.warn, fontWeight: '600', fontSize: 13 }}>Pending Review</Text>
                      </View>
                      <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>Diamond Angels is reviewing your selection and confirming talent availability.</Text>
                    </View>
                  )}
                  {item.status === 'confirmed' && (
                    <View style={{ marginTop: 12, backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 10, padding: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={C.green} />
                        <Text style={{ color: C.green, fontWeight: '600', fontSize: 13 }}>Confirmed</Text>
                      </View>
                      <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>All selected talent have been confirmed for your event. Contact details shared via email.</Text>
                    </View>
                  )}
                  {item.status === 'reviewed' && (
                    <View style={{ marginTop: 12, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 10, padding: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="eye-outline" size={16} color="#8B5CF6" />
                        <Text style={{ color: '#8B5CF6', fontWeight: '600', fontSize: 13 }}>Under Review</Text>
                      </View>
                      <Text style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>Our team is reaching out to the selected talent. We'll update you shortly.</Text>
                    </View>
                  )}

                  {/* Cancel Booking */}
                  <TouchableOpacity
                    style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#EF4444', paddingVertical: 12, borderRadius: 12 }}
                    onPress={() => Alert.alert(
                      'Cancel Booking',
                      `Are you sure you want to cancel your "${item.type}" booking for ${item.date}? This will notify Diamond Angels and release all selected talent.`,
                      [
                        { text: 'Keep Booking', style: 'cancel' },
                        { text: 'Cancel Booking', style: 'destructive', onPress: () => {
                          Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully. Selected talent have been notified.');
                          setExpanded(null);
                        }},
                      ]
                    )}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                    <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 14 }}>Cancel Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="heart-outline" size={48} color={C.muted} />
            <Text style={{ color: C.sub, fontSize: 16, fontWeight: '600', marginTop: 12 }}>No Selections Yet</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 6, textAlign: 'center' }}>Search for talent and submit your selection to get started.</Text>
          </View>
        }
      />

      {/* Talent Detail Modal */}
      <Modal visible={!!detailTalent} animationType="slide" transparent>
        {detailTalent && (
          <View style={s.modalBg}>
            <View style={s.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <PhotoSlider photos={detailTalent.photos} />
                <Text style={[s.h1, { marginTop: 16 }]}>{detailTalent.firstName} {detailTalent.lastName}</Text>
                <Text style={s.listSub}>{detailTalent.city}, {detailTalent.area} · {detailTalent.race} · {detailTalent.bodyType} · {detailTalent.heightCm}cm</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {detailTalent.categories.map((c: string, i: number) => <View key={i} style={sty.chip}><Text style={sty.chipText}>{c}</Text></View>)}
                </View>
                <Text style={[s.h2, { marginTop: 16 }]}>Background</Text>
                <Text style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>{detailTalent.background}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Qualifications</Text>
                <Text style={{ color: C.text, fontSize: 13 }}>{detailTalent.qualifications}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Skills</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {detailTalent.skills.map((sk: string, i: number) => <View key={i} style={[sty.chip, { backgroundColor: 'rgba(139,92,246,0.12)' }]}><Text style={[sty.chipText, { color: '#A78BFA' }]}>{sk}</Text></View>)}
                </View>
                <Text style={[s.h2, { marginTop: 12 }]}>Work Experience</Text>
                <Text style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>{detailTalent.workExperience}</Text>
                <Text style={[s.h2, { marginTop: 12 }]}>Availability</Text>
                <Text style={{ color: C.text, fontSize: 13, lineHeight: 19 }}>{detailTalent.availability}</Text>
              </ScrollView>
              <TouchableOpacity style={s.goldBtn} onPress={() => setDetailTalent(null)}>
                <Text style={s.goldBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function ClientGigBoard() {
  const [detail, setDetail] = useState<any>(null);
  const [showPost, setShowPost] = useState(false);
  const [postType, setPostType] = useState('');
  const [postCats, setPostCats] = useState<Set<string>>(new Set());
  const [postCount, setPostCount] = useState('');
  const [postCity, setPostCity] = useState('');
  const [postNotes, setPostNotes] = useState('');

  const togglePostCat = (cat: string) => {
    const next = new Set(postCats);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setPostCats(next);
  };

  const statusColor = (needed: number, interests: number) => {
    if (interests >= needed) return C.gold;
    if (interests >= needed * 0.5) return C.warn;
    return C.green;
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={s.h1}>Gig Board</Text>
        <Text style={{ color: C.sub, fontSize: 13, marginTop: 2 }}>{GIGS.length} open opportunities</Text>
      </View>

      <FlatList
        data={GIGS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 80 }}
        ListHeaderComponent={
          <TouchableOpacity
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, marginBottom: 16,
            }}
            onPress={() => setShowPost(true)}
          >
            <Ionicons name="add-circle" size={20} color={C.black} />
            <Text style={{ color: C.black, fontWeight: '700', fontSize: 15 }}>Post a Gig Request</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ backgroundColor: C.card, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}
            onPress={() => setDetail(item)}
            activeOpacity={0.7}
          >
            {/* Header with event type badge */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 8 }}>
              <View style={{ backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: C.gold, fontSize: 11, fontWeight: '600' }}>{item.type}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                <Text style={[s.badgeText, { color: C.green }]}>Open</Text>
              </View>
            </View>

            {/* Title and description */}
            <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 17, marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ color: C.sub, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>{item.desc}</Text>
            </View>

            {/* Details grid */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 12, gap: 16 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <Ionicons name="calendar-outline" size={13} color={C.muted} />
                  <Text style={{ color: C.text, fontSize: 12 }}>{item.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location-outline" size={13} color={C.muted} />
                  <Text style={{ color: C.text, fontSize: 12 }}>{item.city}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <Ionicons name="people-outline" size={13} color={C.muted} />
                  <Text style={{ color: C.text, fontSize: 12 }}>{item.needed} talent needed</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="cash-outline" size={13} color={C.muted} />
                  <Text style={{ color: C.gold, fontSize: 12, fontWeight: '600' }}>{item.comp}</Text>
                </View>
              </View>
            </View>

            {/* Categories and interest bar */}
            <View style={{ borderTopWidth: 1, borderTopColor: C.border, padding: 14, paddingTop: 10 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {item.categories.map((c: string, i: number) => (
                  <View key={i} style={{ backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                    <Text style={{ color: '#A78BFA', fontSize: 11, fontWeight: '500' }}>{c}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: C.cardLight }}>
                  <View style={{ width: `${Math.min((item.interests / item.needed) * 100, 100)}%`, height: '100%', borderRadius: 2, backgroundColor: statusColor(item.needed, item.interests) }} />
                </View>
                <Text style={{ color: C.sub, fontSize: 11 }}>{item.interests}/{item.needed} interested</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Gig Detail Overlay */}
      {detail && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end', zIndex: 1000 }}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 }}>
                  <Text style={{ color: C.gold, fontSize: 12, fontWeight: '600' }}>{detail.type}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                  <Text style={[s.badgeText, { color: C.green }]}>Open</Text>
                </View>
              </View>

              <Text style={s.h1}>{detail.title}</Text>
              <Text style={{ color: C.sub, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 16 }}>{detail.desc}</Text>

              <View style={{ backgroundColor: C.cardLight, borderRadius: 12, padding: 14, gap: 12, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="calendar" size={16} color={C.gold} />
                  <Text style={{ color: C.text, fontSize: 14 }}>Date: <Text style={{ fontWeight: '600' }}>{detail.date}</Text></Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="location" size={16} color={C.gold} />
                  <Text style={{ color: C.text, fontSize: 14 }}>Venue: <Text style={{ fontWeight: '600' }}>{detail.venue}</Text></Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="navigate" size={16} color={C.gold} />
                  <Text style={{ color: C.text, fontSize: 14 }}>City: <Text style={{ fontWeight: '600' }}>{detail.city}</Text></Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="people" size={16} color={C.gold} />
                  <Text style={{ color: C.text, fontSize: 14 }}>Talent Needed: <Text style={{ fontWeight: '600' }}>{detail.needed}</Text></Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="cash" size={16} color={C.gold} />
                  <Text style={{ color: C.text, fontSize: 14 }}>Compensation: <Text style={{ fontWeight: '600', color: C.gold }}>{detail.comp}</Text></Text>
                </View>
              </View>

              <Text style={s.h2}>Required Categories</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {detail.categories.map((c: string, i: number) => (
                  <View key={i} style={sty.chip}><Text style={sty.chipText}>{c}</Text></View>
                ))}
              </View>

              <Text style={s.h2}>Interest</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: C.cardLight }}>
                  <View style={{ width: `${Math.min((detail.interests / detail.needed) * 100, 100)}%`, height: '100%', borderRadius: 4, backgroundColor: C.gold }} />
                </View>
                <Text style={{ color: C.text, fontWeight: '600', fontSize: 14 }}>{detail.interests}/{detail.needed}</Text>
              </View>
              <Text style={{ color: C.sub, fontSize: 12 }}>{detail.needed - detail.interests} more talent needed</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => Alert.alert('Interest Submitted', `Your interest in "${detail.title}" has been noted. Diamond Angels will contact you with next steps.`, [{ text: 'OK' }])}
                >
                  <Text style={{ color: C.black, fontWeight: '700', fontSize: 15 }}>Express Interest</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, borderWidth: 1.5, borderColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => Alert.alert(
                    'Cancel Request',
                    `Are you sure you want to cancel your request for "${detail.title}"? This action cannot be undone.`,
                    [
                      { text: 'Keep Request', style: 'cancel' },
                      { text: 'Cancel Request', style: 'destructive', onPress: () => {
                        Alert.alert('Request Cancelled', 'Your request has been withdrawn successfully.');
                        setDetail(null);
                      }},
                    ]
                  )}
                >
                  <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 15 }}>Cancel Request</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <TouchableOpacity style={s.goldBtn} onPress={() => setDetail(null)}>
              <Text style={s.goldBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Post Gig Overlay */}
      {showPost && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end', zIndex: 1000 }}>
          <View style={{ backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={{ color: C.text, fontWeight: '800', fontSize: 20, marginBottom: 4 }}>Post a Gig Request</Text>
              <Text style={{ color: C.sub, fontSize: 13, marginBottom: 16 }}>Tell us what talent you need</Text>

              <Text style={fStyles.filterLabel}>Event Type</Text>
              <View style={fStyles.optionRow}>
                {['Brand Activation', 'Music Festival', 'Corporate Event', 'Fashion Show', 'Product Launch', 'Conference', 'Club', 'Movie', 'TV Advert'].map(t => (
                  <TouchableOpacity key={t} style={[fStyles.optionChip, postType === t && fStyles.optionChipActive]} onPress={() => setPostType(postType === t ? '' : t)}>
                    <Text style={[fStyles.optionText, postType === t && { color: C.black }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={fStyles.filterLabel}>Talent Categories Needed</Text>
              <View style={fStyles.optionRow}>
                {['Model', 'Hostess', 'Promoter', 'Brand Ambassador', 'Bottle Girl', 'Ambience', 'Actress', 'Dancer'].map(cat => (
                  <TouchableOpacity key={cat} style={[fStyles.optionChip, postCats.has(cat) && fStyles.optionChipActive]} onPress={() => togglePostCat(cat)}>
                    <Text style={[fStyles.optionText, postCats.has(cat) && { color: C.black }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={fStyles.filterLabel}>Number of Talent</Text>
              <View style={fStyles.optionRow}>
                {['1-5', '6-10', '11-20', '20+'].map(n => (
                  <TouchableOpacity key={n} style={[fStyles.optionChip, postCount === n && fStyles.optionChipActive]} onPress={() => setPostCount(postCount === n ? '' : n)}>
                    <Text style={[fStyles.optionText, postCount === n && { color: C.black }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={fStyles.filterLabel}>City</Text>
              <View style={fStyles.optionRow}>
                {['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Other'].map(c => (
                  <TouchableOpacity key={c} style={[fStyles.optionChip, postCity === c && fStyles.optionChipActive]} onPress={() => setPostCity(postCity === c ? '' : c)}>
                    <Text style={[fStyles.optionText, postCity === c && { color: C.black }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={fStyles.filterLabel}>Notes & Requirements</Text>
              <TextInput
                style={{ backgroundColor: C.cardLight, borderRadius: 12, padding: 14, color: C.text, fontSize: 14, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: C.border, marginBottom: 4 }}
                placeholder="Dress code, timing, venue details, special requirements..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={4}
                value={postNotes}
                onChangeText={setPostNotes}
              />

              <View style={{ backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 14, marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="information-circle" size={18} color={C.gold} />
                  <Text style={{ color: C.gold, fontWeight: '600', fontSize: 13 }}>What happens next?</Text>
                </View>
                <Text style={{ color: C.sub, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                  Your gig will be posted on our talent board. Qualified talent will express interest, and we'll share their profiles with you within 24-48 hours.
                </Text>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.goldBtn, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}
                onPress={() => {
                  Alert.alert('Gig Request Submitted!', 'Your gig request has been posted. Diamond Angels will share interested talent profiles with you within 24-48 hours.', [{ text: 'OK', onPress: () => { setShowPost(false); setPostType(''); setPostCats(new Set()); setPostCount(''); setPostCity(''); setPostNotes(''); } }]);
                }}
              >
                <Ionicons name="megaphone" size={16} color={C.black} />
                <Text style={s.goldBtnText}>Post Gig</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.goldBtn, { paddingHorizontal: 20, backgroundColor: C.cardLight }]} onPress={() => setShowPost(false)}>
                <Text style={{ color: C.sub, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ======= TALENT SCREENS =======
function TalentProfile() {
  const [talent, setTalent] = useState({ ...TALENT[0] });
  const [editing, setEditing] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Edit state
  const [eFirstName, setEFirstName] = useState(talent.firstName);
  const [eLastName, setELastName] = useState(talent.lastName);
  const [eCity, setECity] = useState(talent.city);
  const [eArea, setEArea] = useState(talent.area);
  const [eRace, setERace] = useState(talent.race);
  const [eBodyType, setEBodyType] = useState(talent.bodyType);
  const [eHeight, setEHeight] = useState(String(talent.heightCm));
  const [eBg, setEBg] = useState(talent.background);
  const [eQualifications, setEQualifications] = useState(talent.qualifications);
  const [eWorkExp, setEWorkExp] = useState(talent.workExperience);
  const [eAvailability, setEAvailability] = useState(talent.availability);
  const [eCategories, setECategories] = useState<Set<string>>(new Set(talent.categories));
  const [eSkills, setESkills] = useState(talent.skills.join(', '));
  const [eTalents, setETalents] = useState(talent.talents.join(', '));
  const [eHobbies, setEHobbies] = useState(talent.hobbies.join(', '));

  const HERO_H = width * 1.2;
  const RACE_OPTS = ['Black', 'White', 'Coloured', 'Indian', 'Asian', 'Other'];
  const BODY_OPTS = ['Slim', 'Athletic', 'Curvy', 'Petite', 'Plus Size'];
  const CAT_OPTS = ['Model', 'Hostess', 'Promoter', 'Brand Ambassador', 'Bottle Girl', 'Ambience', 'Actress', 'Dancer'];

  const openEdit = () => {
    setEFirstName(talent.firstName); setELastName(talent.lastName);
    setECity(talent.city); setEArea(talent.area);
    setERace(talent.race); setEBodyType(talent.bodyType);
    setEHeight(String(talent.heightCm)); setEBg(talent.background);
    setEQualifications(talent.qualifications); setEWorkExp(talent.workExperience);
    setEAvailability(talent.availability); setECategories(new Set(talent.categories));
    setESkills(talent.skills.join(', ')); setETalents(talent.talents.join(', '));
    setEHobbies(talent.hobbies.join(', '));
    setEditing(true);
  };

  const saveEdit = () => {
    setTalent({
      ...talent,
      firstName: eFirstName, lastName: eLastName, city: eCity, area: eArea,
      race: eRace, bodyType: eBodyType, heightCm: parseInt(eHeight) || talent.heightCm,
      background: eBg, qualifications: eQualifications, workExperience: eWorkExp,
      availability: eAvailability, categories: Array.from(eCategories),
      skills: eSkills.split(',').map(s => s.trim()).filter(Boolean),
      talents: eTalents.split(',').map(s => s.trim()).filter(Boolean),
      hobbies: eHobbies.split(',').map(s => s.trim()).filter(Boolean),
    });
    setEditing(false);
    Alert.alert('Profile Updated', 'Your changes have been saved.');
  };

  const toggleCat = (cat: string) => {
    const next = new Set(eCategories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setECategories(next);
  };

  const SectionHeader = ({ icon, title, color, onEdit }: { icon: string; title: string; color: string; onEdit?: () => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon as any} size={16} color={color} />
        </View>
        <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{title}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={{ padding: 6 }}>
          <Ionicons name="pencil" size={16} color={C.gold} />
        </TouchableOpacity>
      )}
    </View>
  );

  // ---- EDIT MODE ----
  if (editing) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <TouchableOpacity onPress={() => setEditing(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
            <Text style={{ color: C.text, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 18 }}>Edit Profile</Text>
          <TouchableOpacity onPress={saveEdit}>
            <Text style={{ color: C.gold, fontWeight: '700', fontSize: 16 }}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Photo Thumbnails */}
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 10 }}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {talent.photos.map((url: string, i: number) => (
              <View key={i} style={{ marginRight: 10, position: 'relative' }}>
                <Image source={{ uri: url }} style={{ width: 70, height: 90, borderRadius: 10, borderWidth: i === 0 ? 2 : 0, borderColor: C.gold }} />
                {i === 0 && (
                  <View style={{ position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: C.gold, borderRadius: 6, paddingVertical: 2, alignItems: 'center' }}>
                    <Text style={{ color: C.black, fontSize: 8, fontWeight: '700' }}>MAIN</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Name */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>First Name</Text>
              <TextInput style={demoEditInput} value={eFirstName} onChangeText={setEFirstName} placeholderTextColor={C.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Last Name</Text>
              <TextInput style={demoEditInput} value={eLastName} onChangeText={setELastName} placeholderTextColor={C.muted} />
            </View>
          </View>

          {/* Location */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>City</Text>
              <TextInput style={demoEditInput} value={eCity} onChangeText={setECity} placeholderTextColor={C.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Area</Text>
              <TextInput style={demoEditInput} value={eArea} onChangeText={setEArea} placeholderTextColor={C.muted} />
            </View>
          </View>

          {/* Height */}
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Height (cm)</Text>
          <TextInput style={[demoEditInput, { marginBottom: 14 }]} value={eHeight} onChangeText={setEHeight} keyboardType="numeric" placeholderTextColor={C.muted} />

          {/* Race */}
          <Text style={{ color: '#A78BFA', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Race</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {RACE_OPTS.map(r => (
              <TouchableOpacity key={r} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eRace === r ? '#A78BFA' : C.cardLight, borderWidth: 1, borderColor: eRace === r ? '#A78BFA' : C.border }} onPress={() => setERace(r)}>
                <Text style={{ color: eRace === r ? C.black : C.text, fontSize: 13, fontWeight: '600' }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Body Type */}
          <Text style={{ color: '#2DD4BF', fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Body Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {BODY_OPTS.map(b => (
              <TouchableOpacity key={b} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eBodyType === b ? '#2DD4BF' : C.cardLight, borderWidth: 1, borderColor: eBodyType === b ? '#2DD4BF' : C.border }} onPress={() => setEBodyType(b)}>
                <Text style={{ color: eBodyType === b ? C.black : C.text, fontSize: 13, fontWeight: '600' }}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories */}
          <Text style={{ color: C.gold, fontWeight: '700', fontSize: 14, marginBottom: 8 }}>Categories</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {CAT_OPTS.map(c => (
              <TouchableOpacity key={c} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: eCategories.has(c) ? C.gold : C.cardLight, borderWidth: 1, borderColor: eCategories.has(c) ? C.gold : C.border }} onPress={() => toggleCat(c)}>
                <Text style={{ color: eCategories.has(c) ? C.black : C.text, fontSize: 13, fontWeight: '600' }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Areas */}
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>About Me / Background</Text>
          <TextInput style={[demoEditInput, { minHeight: 80, textAlignVertical: 'top' }]} value={eBg} onChangeText={setEBg} multiline placeholderTextColor={C.muted} />
          <View style={{ height: 14 }} />
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Qualifications</Text>
          <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top' }]} value={eQualifications} onChangeText={setEQualifications} multiline placeholderTextColor={C.muted} />
          <View style={{ height: 14 }} />
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Skills (comma separated)</Text>
          <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top' }]} value={eSkills} onChangeText={setESkills} multiline placeholderTextColor={C.muted} />
          <View style={{ height: 14 }} />
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Talents (comma separated)</Text>
          <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top' }]} value={eTalents} onChangeText={setETalents} multiline placeholderTextColor={C.muted} />
          <View style={{ height: 14 }} />
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Hobbies (comma separated)</Text>
          <TextInput style={[demoEditInput, { minHeight: 50, textAlignVertical: 'top' }]} value={eHobbies} onChangeText={setEHobbies} multiline placeholderTextColor={C.muted} />
          <View style={{ height: 14 }} />
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Work Experience</Text>
          <TextInput style={[demoEditInput, { minHeight: 80, textAlignVertical: 'top' }]} value={eWorkExp} onChangeText={setEWorkExp} multiline placeholderTextColor={C.muted} />
          <View style={{ height: 14 }} />
          <Text style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>Availability</Text>
          <TextInput style={[demoEditInput, { minHeight: 60, textAlignVertical: 'top' }]} value={eAvailability} onChangeText={setEAvailability} multiline placeholderTextColor={C.muted} />

          <TouchableOpacity style={{ backgroundColor: C.gold, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 }} onPress={saveEdit}>
            <Text style={{ color: C.black, fontWeight: '800', fontSize: 16 }}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---- VIEW MODE ----
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Photo Slider */}
        <View style={{ height: HERO_H, position: 'relative' }}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={(e: any) => setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}
          >
            {talent.photos.map((url: string, i: number) => (
              <Image key={i} source={{ uri: url }} style={{ width, height: HERO_H, resizeMode: 'cover' }} />
            ))}
          </ScrollView>
          {/* Gradient overlay */}
          <LinearGradient colors={['transparent', 'rgba(10,10,15,0.8)', C.bg]} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: HERO_H * 0.5 }} />
          {/* Name & badge on overlay */}
          <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
            <Text style={{ color: C.text, fontWeight: '900', fontSize: 28 }}>{talent.firstName} {talent.lastName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Ionicons name="location" size={14} color={C.gold} />
              <Text style={{ color: C.sub, fontSize: 14 }}>{talent.city}, {talent.area}</Text>
              <View style={{ backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginLeft: 8 }}>
                <Text style={{ color: C.green, fontSize: 11, fontWeight: '700' }}>Approved</Text>
              </View>
            </View>
            {/* Dot indicators */}
            {talent.photos.length > 1 && (
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                {talent.photos.map((_: string, i: number) => (
                  <View key={i} style={{ width: photoIdx === i ? 24 : 8, height: 4, borderRadius: 2, backgroundColor: photoIdx === i ? C.gold : 'rgba(255,255,255,0.3)' }} />
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Stat Cards Row */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#A78BFA' }}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>HEIGHT</Text>
              <Text style={{ color: C.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{talent.heightCm}<Text style={{ fontSize: 13, color: C.sub }}> cm</Text></Text>
            </View>
            <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#2DD4BF' }}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>BUILD</Text>
              <Text style={{ color: C.text, fontSize: 17, fontWeight: '800', marginTop: 4 }}>{talent.bodyType}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#60A5FA' }}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>RACE</Text>
              <Text style={{ color: C.text, fontSize: 17, fontWeight: '800', marginTop: 4 }}>{talent.race}</Text>
            </View>
          </View>

          {/* Category Tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {talent.categories.map((c: string, i: number) => (
              <View key={i} style={{ backgroundColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' }}>
                <Text style={{ color: C.gold, fontSize: 12, fontWeight: '600' }}>{c}</Text>
              </View>
            ))}
          </View>

          {/* Photo Thumbnails Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            {talent.photos.map((url: string, i: number) => (
              <View key={i} style={{ marginRight: 8 }}>
                <Image source={{ uri: url }} style={{ width: 64, height: 84, borderRadius: 10, borderWidth: photoIdx === i ? 2 : 0, borderColor: C.gold }} />
              </View>
            ))}
          </ScrollView>

          {/* About Me */}
          <SectionHeader icon="person-circle" title="About Me" color="#A78BFA" onEdit={openEdit} />
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 21 }}>{talent.background}</Text>
          </View>

          {/* Qualifications */}
          <SectionHeader icon="school" title="Qualifications" color="#F59E0B" onEdit={openEdit} />
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 21 }}>{talent.qualifications}</Text>
          </View>

          {/* Skills */}
          <SectionHeader icon="flash" title="Skills" color="#2DD4BF" onEdit={openEdit} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {talent.skills.map((sk: string, i: number) => (
              <View key={i} style={{ backgroundColor: 'rgba(45,212,191,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                <Text style={{ color: '#2DD4BF', fontSize: 12, fontWeight: '500' }}>{sk}</Text>
              </View>
            ))}
          </View>

          {/* Talents */}
          <SectionHeader icon="star" title="Talents" color="#F472B6" onEdit={openEdit} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {talent.talents.map((t: string, i: number) => (
              <View key={i} style={{ backgroundColor: 'rgba(244,114,182,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                <Text style={{ color: '#F472B6', fontSize: 12, fontWeight: '500' }}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Hobbies */}
          <SectionHeader icon="heart" title="Hobbies" color="#FB923C" onEdit={openEdit} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {talent.hobbies.map((h: string, i: number) => (
              <View key={i} style={{ backgroundColor: 'rgba(251,146,60,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                <Text style={{ color: '#FB923C', fontSize: 12, fontWeight: '500' }}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Work Experience */}
          <SectionHeader icon="briefcase" title="Work Experience" color="#60A5FA" onEdit={openEdit} />
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 21 }}>{talent.workExperience}</Text>
          </View>

          {/* Availability */}
          <SectionHeader icon="calendar" title="Availability" color="#34D399" onEdit={openEdit} />
          <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 20 }}>
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 21 }}>{talent.availability}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Edit Button */}
      <TouchableOpacity
        onPress={openEdit}
        style={{ position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
      >
        <Ionicons name="create" size={24} color={C.black} />
      </TouchableOpacity>
    </View>
  );
}

function TalentGigs() {
  const [interested, setInterested] = useState<Set<string>>(new Set(['g1']));
  return (
    <SafeAreaView style={s.safe}>
      <Text style={[s.h1, { padding: 16, paddingBottom: 8 }]}>Available Gigs</Text>
      <FlatList data={GIGS} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16, paddingTop: 0 }} renderItem={({ item }) => {
        const isInt = interested.has(item.id);
        return (
          <View style={s.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.listTitle}>{item.title}</Text>
              <Text style={s.listSub}>{item.type} · {item.city} · {item.date}</Text>
              <Text style={s.listSub}>{item.needed} needed · {item.comp}</Text>
            </View>
            <TouchableOpacity
              style={[s.intBtn, isInt && s.intBtnActive]}
              onPress={() => {
                const next = new Set(interested);
                if (isInt) next.delete(item.id); else next.add(item.id);
                setInterested(next);
              }}
            >
              <Ionicons name={isInt ? 'checkmark' : 'hand-right-outline'} size={14} color={isInt ? C.black : C.gold} />
              <Text style={[s.intBtnText, isInt && { color: C.black }]}>{isInt ? 'Interested' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        );
      }} />
    </SafeAreaView>
  );
}

function TalentActivity() {
  const items = [
    { id: '1', gig: 'Summer Festival Promoters', city: 'Johannesburg', date: '15-16 Feb 2025', status: 'interested' },
    { id: '2', gig: 'Luxury Brand Launch', city: 'Cape Town', date: '8 Mar 2025', status: 'selected' },
  ];
  return (
    <SafeAreaView style={s.safe}>
      <Text style={[s.h1, { padding: 16, paddingBottom: 8 }]}>My Activity</Text>
      <FlatList data={items} keyExtractor={i => i.id} contentContainerStyle={{ padding: 16, paddingTop: 0 }} renderItem={({ item }) => (
        <View style={s.listCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.listTitle}>{item.gig}</Text>
            <Text style={s.listSub}>{item.city} · {item.date}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: item.status==='selected'?'rgba(16,185,129,0.15)':'rgba(201,168,76,0.15)' }]}>
            <Text style={[s.badgeText,{color:item.status==='selected'?C.green:C.gold}]}>{item.status}</Text>
          </View>
        </View>
      )} />
    </SafeAreaView>
  );
}

// ======= TAB NAVIGATORS =======
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border }, tabBarActiveTintColor: C.gold, tabBarInactiveTintColor: C.muted }}>
      <Tab.Screen name="Dashboard" component={AdminDash} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tab.Screen name="Talent" component={AdminTalent} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tab.Screen name="Bookings" component={AdminBookings} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tab.Screen name="Gigs" component={AdminGigs} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="megaphone" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function ClientTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border }, tabBarActiveTintColor: C.gold, tabBarInactiveTintColor: C.muted }}>
      <Tab.Screen name="Search" component={ClientSearch} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="search" size={size} color={color} /> }} />
      <Tab.Screen name="Selections" component={ClientBookings} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="heart" size={size} color={color} /> }} />
      <Tab.Screen name="GigBoard" component={ClientGigBoard} options={{ tabBarLabel: 'Gig Board', tabBarIcon: ({ color, size }: any) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <Tab.Screen name="Outfits" component={DemoOutfitsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="shirt-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function TalentTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border }, tabBarActiveTintColor: C.gold, tabBarInactiveTintColor: C.muted }}>
      <Tab.Screen name="Profile" component={TalentProfile} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="person" size={size} color={color} /> }} />
      <Tab.Screen name="Gigs" component={TalentGigs} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <Tab.Screen name="Activity" component={TalentActivity} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="pulse" size={size} color={color} /> }} />
      <Tab.Screen name="Outfits" component={DemoOutfitsScreen} options={{ tabBarIcon: ({ color, size }: any) => <Ionicons name="shirt-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

// ======= MAIN DEMO APP =======
type DemoRole = 'admin' | 'client' | 'talent' | null;

export default function DemoApp({ onExit }: { onExit: () => void }) {
  const [role, setRole] = useState<DemoRole>(null);
  const [showSwitcher, setShowSwitcher] = useState(false);

  if (!role) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', padding: 28 }]}>
        <StatusBar barStyle="light-content" />
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={s.dIcon}><Ionicons name="diamond" size={36} color={C.gold} /></View>
          <Text style={[s.h1, { textAlign: 'center', marginTop: 14 }]}>Diamond Angels</Text>
          <Text style={{ color: C.sub, textAlign: 'center', marginTop: 6 }}>Choose a role to explore</Text>
        </View>
        {([
          { key: 'admin' as const, icon: 'shield-checkmark' as const, label: 'Agency Admin', desc: 'Manage talent, bookings & gigs' },
          { key: 'client' as const, icon: 'business' as const, label: 'Client', desc: 'Search talent & book' },
          { key: 'talent' as const, icon: 'person' as const, label: 'Talent', desc: 'Profile & gigs' },
        ]).map(r => (
          <TouchableOpacity key={r.key} style={s.roleCard} onPress={() => setRole(r.key)}>
            <View style={s.roleIcon}><Ionicons name={r.icon} size={24} color={C.gold} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{r.label}</Text>
              <Text style={{ color: C.sub, fontSize: 13, marginTop: 2 }}>{r.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.muted} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.exitBtn} onPress={onExit}>
          <Text style={{ color: C.sub, fontSize: 14 }}>Exit Demo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      {role === 'admin' && <AdminTabs />}
      {role === 'client' && <ClientTabs />}
      {role === 'talent' && <TalentTabs />}
      <TouchableOpacity style={s.pill} onPress={() => setShowSwitcher(true)}>
        <Ionicons name="diamond" size={12} color={C.black} />
        <Text style={s.pillText}>DEMO: {role.toUpperCase()}</Text>
      </TouchableOpacity>
      <Modal visible={showSwitcher} transparent animationType="fade">
        <TouchableOpacity style={s.switcherBg} activeOpacity={1} onPress={() => setShowSwitcher(false)}>
          <View style={s.switcherBox}>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Switch Role</Text>
            {(['admin','client','talent'] as const).map(r => (
              <TouchableOpacity key={r} style={[s.switcherItem, role===r && { backgroundColor: 'rgba(201,168,76,0.15)' }]} onPress={() => { setRole(r); setShowSwitcher(false); }}>
                <Text style={{ color: role===r ? C.gold : C.text, fontWeight: '600', fontSize: 15, textTransform: 'capitalize' }}>{r}</Text>
                {role===r && <Ionicons name="checkmark" size={18} color={C.gold} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.switcherItem} onPress={() => { setShowSwitcher(false); onExit(); }}>
              <Text style={{ color: C.red, fontSize: 14, fontWeight: '600' }}>Exit Demo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  h1: { fontSize: 24, fontWeight: '800', color: C.text },
  h2: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 8 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: C.card, borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800', color: C.gold },
  statLabel: { fontSize: 12, color: C.sub, marginTop: 4 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12 },
  listThumb: { width: 48, height: 48, borderRadius: 24 },
  listTitle: { color: C.text, fontWeight: '600', fontSize: 15 },
  listSub: { color: C.sub, fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  talentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 10, gap: 12 },
  talentThumb: { width: 56, height: 72, borderRadius: 8 },
  gridCard: { backgroundColor: C.card, borderRadius: 10, overflow: 'hidden' },
  gridImg: { resizeMode: 'cover' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  goldBtn: { backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  goldBtnText: { color: C.black, fontWeight: '700', fontSize: 15 },
  intBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.gold },
  intBtnActive: { backgroundColor: C.gold, borderColor: C.gold },
  intBtnText: { fontSize: 12, fontWeight: '600', color: C.gold },
  dIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 18, marginBottom: 12, gap: 14, borderWidth: 1, borderColor: C.border },
  roleIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
  exitBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 12 },
  pill: { position: 'absolute', top: 54, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 999 },
  pillText: { color: C.black, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  switcherBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 32 },
  switcherBox: { backgroundColor: C.card, borderRadius: 16, padding: 20 },
  switcherItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10 },
});

const sty = StyleSheet.create({
  chip: { backgroundColor: 'rgba(201,168,76,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  chipText: { color: C.gold, fontSize: 11, fontWeight: '500' },
});

const fStyles = StyleSheet.create({
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.gold, backgroundColor: 'transparent',
  },
  filterChipActive: { backgroundColor: C.gold },
  filterChipText: { color: C.gold, fontSize: 13, fontWeight: '600' },
  activeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  activeTagText: { color: C.gold, fontSize: 12, fontWeight: '500' },
  checkbox: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: C.gold, borderColor: C.gold,
  },
  selectionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.gold, paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 12,
  },
  filterLabel: {
    color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 8, marginTop: 16,
  },
  optionRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8,
  },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.cardLight,
  },
  optionChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  optionText: { color: C.text, fontSize: 13, fontWeight: '500' },
  heightInput: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center',
  },
  hChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.cardLight,
  },
  hChipActive: { backgroundColor: C.gold, borderColor: C.gold },
  hChipText: { color: C.text, fontSize: 12, fontWeight: '500' },
  formField: {
    backgroundColor: C.cardLight, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
});

const demoEditInput: any = {
  backgroundColor: C.cardLight, borderRadius: 12, padding: 14,
  borderWidth: 1, borderColor: C.border, color: C.text, fontSize: 14,
};