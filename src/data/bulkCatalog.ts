// Bulk Purchase taxonomy — used by mega-menu, filters, and listing page.

export const BULK_BRANDS = [
  "1Veda", "Kairali", "Dindayal", "Dabur", "Kerala Ayurveda",
  "Alarsin", "Arya Vaidya Pharmacy", "Aushadhi Bhavan", "AVN Ayurveda", "Baidyanath Jhansi",
  "Baidyanath Kolkata", "Baidyanath Nagpur", "Baidyanath Patna", "Bhardwaj Pharmaceutical Works", "Dhootapapeshwar",
  "Dr JRK's Research", "Goodcare", "Gufic", "Herbal Canada", "Himalaya",
  "Himratan Pharmacy", "Kapiva", "Kottakkal", "Makson Healthcare", "Multani",
  "Nagarjuna (Gujrat)", "Nagarjuna Ayurveda", "AyuzeeStreet", "P&G", "Rajasthan Aushadhalaya",
  "Sandu", "SG Phyto Pharma", "Siddhayu", "SKM Siddha & Ayurveda", "SN Herbals",
  "Solumilks", "Unicharm", "Unjha", "Unjha Ahmedabad", "Vaidyaratnam",
  "Vansaar", "VASU", "Vyas", "Zandu",
] as const;

export const CLASSICAL_TYPES = [
  "Bhasma", "Choorna/ Churna", "Guggulu", "Sinduram Capsule", "Loha / Mandoor",
  "Parpati", "Pishti", "Rasakalpa/ Rasakalpa Vati", "Satva", "Suvarna Kalpa (Gold)",
  "Ghrita/ Ghrutham", "Kera Tailam/ Keram", "Kshara", "Arishta/ Arishtam", "Asava/ Asavam",
  "Rasayana/ Rasayanam", "Ark", "Avaleha/ Lehyam", "Gulika/ Tablet/ Vati", "Kashyam/ Kwatha/ Kadha",
  "Kashayam Tablet/ Kwatha Tablet", "Taila/ Thailam/ Oil", "Capsule", "Choorna Tablet/ Churna Tablet", "Ointment",
  "Khand/ Pak", "Granules", "Kupipakwa Rasayan/ Sindoor", "Bhasma Capsule", "Eranda Tailam",
  "Netra Kalpa/ Eye Drops", "Ghan Vati/ Ghan Tablet", "Gulam/ Gudam", "Gulkand", "Honey/ Madhu",
  "Isabgol", "Kuzhambu", "Lepa/ Lepam", "Mezhukupakam", "Soft Gel Capsule",
  "Syrup/ Rasam", "Yamakam", "Raw Herb", "Bharad Choorna (Joukut)",
] as const;

export const PATENTED_TYPES = [
  "Ointment", "Syrup", "Soft Gel Capsules", "Gel", "Nasal Drop",
  "Oil / Taila", "Tooth paste", "Tooth powder", "Churna/ Powder", "Cream",
  "Lozenges", "Body Cleansing Powder", "Herbal Drink", "Face Pack", "Shampoo",
  "Soap", "Balm", "Eye Drop", "Honey", "Spray",
  "Granules", "Juice", "Tablet", "Gulkand/ Pak", "Drops",
  "Herbal Tea", "Lotion", "Suvarna Kalpa (Gold Products)", "Hand Sanitizer", "Capsule",
  "Special Product", "Baby Care", "Face Wash", "Dusting Powder", "Panchakarma Kit",
  "Combo Set", "Disposable", "Face Cleanser", "Hair Cleanser/ Solution", "Facial Oil",
  "Hair Conditioner", "Hair oil/ Kesh Taila", "Isabgol Granules", "Avaleha/ Prasha", "Liniment",
  "Moisturizer", "Oral Cleanse Liquid", "Sharbat", "Shower Gel", "Suvarna Prashan",
  "Arishta", "Asava", "fairness cream", "Personal Care",
] as const;

export type BulkBrand = typeof BULK_BRANDS[number];
export type ClassicalType = typeof CLASSICAL_TYPES[number];
export type PatentedType = typeof PATENTED_TYPES[number];
