const measures = {
  hemoglobin: {
    en: 'Hemoglobin is the protein in red blood cells that carries oxygen around your body.',
    bn: 'হিমোগ্লোবিন লাল রক্তকণিকার একটি প্রোটিন, যা শরীরের সর্বত্র অক্সিজেন বয়ে নিয়ে যায়।',
  },
  wbc: {
    en: 'White blood cells are part of your body\'s defence system. This test counts how many are in a small amount of blood.',
    bn: 'শ্বেত রক্তকণিকা শরীরের প্রতিরক্ষা ব্যবস্থার অংশ। এই পরীক্ষায় অল্প রক্তে এদের সংখ্যা গোনা হয়।',
  },
  platelet: {
    en: 'Platelets are tiny blood cells that help blood to clot. This test counts them.',
    bn: 'প্লেটলেট ছোট রক্তকণিকা, যা রক্ত জমাট বাঁধতে সাহায্য করে। এই পরীক্ষায় এদের সংখ্যা গোনা হয়।',
  },
  vitamin_d: {
    en: 'Vitamin D helps your body use calcium for your bones. This test measures how much is in your blood.',
    bn: 'ভিটামিন ডি শরীরকে হাড়ের জন্য ক্যালসিয়াম ব্যবহার করতে সাহায্য করে। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  fasting_glucose: {
    en: 'This test measures the sugar (glucose) in your blood after several hours without food.',
    bn: 'এই পরীক্ষায় কয়েক ঘণ্টা না খেয়ে থাকার পর রক্তে শর্করার (গ্লুকোজ) পরিমাণ মাপা হয়।',
  },
  hba1c: {
    en: 'This test shows your average blood sugar over the past two to three months.',
    bn: 'এই পরীক্ষা গত দুই থেকে তিন মাসে আপনার রক্তে শর্করার গড় পরিমাণ দেখায়।',
  },
  total_cholesterol: {
    en: 'Cholesterol is a fatty substance in your blood. This test measures the total amount.',
    bn: 'কোলেস্টেরল রক্তে থাকা একটি চর্বিজাতীয় পদার্থ। এই পরীক্ষায় এর মোট পরিমাণ মাপা হয়।',
  },
  ldl: {
    en: 'LDL is one type of cholesterol in your blood. This test measures how much of it there is.',
    bn: 'এলডিএল রক্তের এক ধরনের কোলেস্টেরল। এই পরীক্ষায় এর পরিমাণ মাপা হয়।',
  },
  hdl: {
    en: 'HDL is another type of cholesterol in your blood. This test measures how much of it there is.',
    bn: 'এইচডিএল রক্তের আরেক ধরনের কোলেস্টেরল। এই পরীক্ষায় এর পরিমাণ মাপা হয়।',
  },
  triglycerides: {
    en: 'Triglycerides are a type of fat in your blood. This test measures how much there is.',
    bn: 'ট্রাইগ্লিসারাইড রক্তে থাকা এক ধরনের চর্বি। এই পরীক্ষায় এর পরিমাণ মাপা হয়।',
  },
  creatinine: {
    en: 'Creatinine is a waste product that your kidneys filter out of your blood. This test measures how much is in your blood.',
    bn: 'ক্রিয়েটিনিন একটি বর্জ্য পদার্থ, যা কিডনি রক্ত থেকে ছেঁকে বের করে। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  uric_acid: {
    en: 'Uric acid is a waste product made when your body breaks down certain foods. This test measures how much is in your blood.',
    bn: 'ইউরিক অ্যাসিড একটি বর্জ্য পদার্থ, যা শরীর কিছু খাবার ভাঙার সময় তৈরি হয়। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  sodium: {
    en: 'Sodium is a salt your body needs to balance its fluids. This test measures how much is in your blood.',
    bn: 'সোডিয়াম একটি লবণ, যা শরীরের তরলের ভারসাম্য রাখতে লাগে। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  potassium: {
    en: 'Potassium is a mineral that helps your nerves and muscles, including the heart, to work. This test measures how much is in your blood.',
    bn: 'পটাশিয়াম একটি খনিজ, যা হৃদপিণ্ডসহ স্নায়ু ও পেশির কাজে সাহায্য করে। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  alt: {
    en: 'ALT is an enzyme found mostly in the liver. This test measures how much is in your blood.',
    bn: 'এএলটি একটি এনজাইম, যা বেশিরভাগ লিভারে থাকে। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  ast: {
    en: 'AST is an enzyme found in the liver and in other parts of the body. This test measures how much is in your blood.',
    bn: 'এএসটি একটি এনজাইম, যা লিভার ও শরীরের অন্য অংশে থাকে। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  bilirubin_total: {
    en: 'Bilirubin is a yellow substance made when old red blood cells break down. This test measures how much is in your blood.',
    bn: 'বিলিরুবিন একটি হলুদ পদার্থ, যা পুরনো লাল রক্তকণিকা ভাঙলে তৈরি হয়। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
  tsh: {
    en: 'TSH is a hormone that tells your thyroid gland how much to work. This test measures how much is in your blood.',
    bn: 'টিএসএইচ একটি হরমোন, যা থাইরয়েড গ্রন্থিকে কতটা কাজ করতে হবে তা জানায়। এই পরীক্ষায় রক্তে এর পরিমাণ মাপা হয়।',
  },
};

const flags = {
  normal: {
    en: 'Your result is {result}, which is inside the reference range ({range}).',
    bn: 'আপনার ফলাফল {result}, যা স্বাভাবিক সীমার ({range}) মধ্যে।',
  },
  high: {
    en: 'Your result is {result}, which is above the reference range ({range}). Many things can change this value, so only a doctor can tell what it means for you.',
    bn: 'আপনার ফলাফল {result}, যা স্বাভাবিক সীমার ({range}) চেয়ে বেশি। অনেক কারণে এই মান বদলাতে পারে, তাই আপনার ক্ষেত্রে এর অর্থ কী তা শুধু ডাক্তারই বলতে পারেন।',
  },
  low: {
    en: 'Your result is {result}, which is below the reference range ({range}). Many things can change this value, so only a doctor can tell what it means for you.',
    bn: 'আপনার ফলাফল {result}, যা স্বাভাবিক সীমার ({range}) চেয়ে কম। অনেক কারণে এই মান বদলাতে পারে, তাই আপনার ক্ষেত্রে এর অর্থ কী তা শুধু ডাক্তারই বলতে পারেন।',
  },
  unknown: {
    en: 'We could not check this value against a reference range. Please compare it with your original report and ask your doctor.',
    bn: 'এই মানটি কোনো স্বাভাবিক সীমার সাথে মিলিয়ে দেখা যায়নি। অনুগ্রহ করে আপনার আসল রিপোর্টের সাথে মিলিয়ে নিন এবং ডাক্তারকে জিজ্ঞেস করুন।',
  },
};

const critical = {
  en: 'This value is far outside the usual range. Please see a doctor soon.',
  bn: 'এই মান স্বাভাবিক সীমা থেকে অনেক দূরে। অনুগ্রহ করে শিগগির ডাক্তার দেখান।',
};

module.exports = { measures, flags, critical, verified: false };