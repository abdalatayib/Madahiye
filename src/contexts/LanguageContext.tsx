import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'so' | 'en' | 'ar';

interface Translations {
  [key: string]: {
    so: string;
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Common
  appName: { so: 'Madahiye', en: 'Madahiye', ar: 'مداحي' },
  signOut: { so: 'Ka Bax', en: 'Sign Out', ar: 'تسجيل الخروج' },
  loading: { so: 'Waa la rarayaa...', en: 'Loading...', ar: 'جارٍ التحميل...' },
  save: { so: 'Keydi', en: 'Save', ar: 'حفظ' },
  cancel: { so: 'Iska daa', en: 'Cancel', ar: 'إلغاء' },
  submit: { so: 'Gudbi', en: 'Submit', ar: 'إرسال' },
  
  // Auth
  welcome: { so: 'Ku soo dhawaada Madahiye', en: 'Welcome to Madahiye', ar: 'مرحباً بكم في مداحي' },
  authSubtext: { so: 'Madal nidaamsan oo loogu talagalay ku deeqidda dhiigga.', en: 'The regulated blood donation platform.', ar: 'منصة منظمة للتبرع بالدم.' },
  signInGoogle: { so: 'Ku gal Google', en: 'Sign in with Google', ar: 'الدخول بواسطة جوجل' },
  signingIn: { so: 'Waa la gelayaa...', en: 'Signing in...', ar: 'جاري الدخول...' },
  authInternalError: { 
    so: 'Adeegga Firebase Auth weli waa la diyaarinayaa ama goobta lama oggola. Fadlan sug dhowr daqiiqo oo isku day mar kale.', 
    en: 'Firebase Auth is still provisioning or domain is not authorized. Please wait a few minutes and try again.', 
    ar: 'لا تزال خدمة Firebase Auth قيد الإعداد أو النطاق غير مصرح به. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.' 
  },
  termsNotice: { so: 'Markaad gasho, waxaad ogolaatay shuruudahayada adeegga.', en: 'By signing in, you agree to our terms of service.', ar: 'بتسجيل الدخول، فإنك توافق على شروط الخدمة الخاصة بنا.' },
  
  // Rules
  rulesTitle: { so: 'Xeerarka Badbaadada Bulshada', en: 'Community Safety Rules', ar: 'قواعد سلامة المجتمع' },
  rule1: { so: 'Deeq dhiig oo sanadle ah oo qasab ah', en: 'Mandatory annual donation', ar: 'تبرع سنوي إلزامي' },
  rule2: { so: 'Hubinta caafimaadka ayaa loo baahan yahay', en: 'Health verification required', ar: 'مطلوب التحقق الصحي' },
  rule3: { so: 'Ugu yaraan $20 oo mahadnaq deeq bixiyaha ah', en: 'Minimum $20 donor appreciation', ar: 'الحد الأدنى 20 دولاراً تقديراً للمتبرع' },

  // Profile Setup
  completeProfile: { so: 'Dhamaystir Profile-kaaga', en: 'Complete Your Profile', ar: 'أكمل ملفك الشخصي' },
  profileSubtext: { so: 'Waxaan u baahanahay faahfaahin yar si aan kuu bilowno.', en: 'We need a few more details to get you started.', ar: 'نحتاج إلى بعض التفاصيل الإضافية لنبدأ.' },
  bloodType: { so: 'Nooca Dhiigga', en: 'Blood Type', ar: 'فصيلة الدم' },
  gender: { so: 'Lab ama Dheddig', en: 'Gender', ar: 'الجنس' },
  male: { so: 'Lab', en: 'Male', ar: 'ذكر' },
  female: { so: 'Dheddig', en: 'Female', ar: 'أنثى' },
  femaleNotice: { so: 'Diiwaangelinta dheddigga waxay u baahan tahay oggolaanshaha Maamulka.', en: 'Female registration requires Admin approval.', ar: 'تسجيل الإناث يتطلب موافقة المسؤول.' },
  completeRegistration: { so: 'Dhamaystir Diiwaangelinta', en: 'Complete Registration', ar: 'إكمال التسجيل' },

  // Dashboard
  activeRequests: { so: 'Codsiyada Firfircoon', en: 'Active Requests', ar: 'الطلبات النشطة' },
  dashboard: { so: 'Dashboard', en: 'Dashboard', ar: 'لوحة القيادة' },
  postRequest: { so: 'Gudbi Codsi', en: 'Post Request', ar: 'نشر طلب' },
  myActivity: { so: 'Waxqabadkayga', en: 'My Activity', ar: 'نشاطي' },
  myRequests: { so: 'Codsiyadayda', en: 'My Requests', ar: 'طلباتي' },
  noRequests: { so: 'Ma jiraan codsiyo dhiig oo firfircoon hadda.', en: 'No active blood requests at the moment.', ar: 'لا توجد طلبات دم نشطة في الوقت الحالي.' },
  acceptRequest: { so: 'Aqbal Codsiga', en: 'Accept Request', ar: 'قبول الطلب' },
  communityRating: { so: 'Qiimaynta Bulshada', en: 'Community Rating', ar: 'تقييم المجتمع' },
  status: { so: 'Heerka', en: 'Status', ar: 'الحالة' },
  postedOn: { so: 'La soo dhajiyay', en: 'Posted on', ar: 'نشر في' },
  theLaw: { so: 'Xeerka', en: 'The Law', ar: 'القانون' },
  law1: { so: 'Qaataha waa inuu bixiyaa $20 gaadiid/nafaqo.', en: 'Recipient must pay $20 for transport/nutrition.', ar: 'يجب على المتلقي دفع 20 دولاراً للنقل/التغذية.' },
  law2: { so: 'Lacagta madasha: $0.50 halkii boostada.', en: 'Platform fee: $0.50 per post.', ar: 'رسوم المنصة: 0.50 دولار لكل منشور.' },
  law3: { so: 'Warbixin been abuur ah: $10 ganaax & 6 bilood oo ganaax ah.', en: 'False reporting: $10 fine & 6-month ban.', ar: 'بلاغ كاذب: غرامة 10 دولارات وحظر لمدة 6 أشهر.' },

  // Request Form
  postBloodRequest: { so: 'Soo dhaji Codsiga Dhiigga', en: 'Post Blood Request', ar: 'نشر طلب دم' },
  urgency: { so: 'Degdegga', en: 'Urgency', ar: 'الاستعجال' },
  hospitalName: { so: 'Magaca Cusbitaalka', en: 'Hospital Name', ar: 'اسم المستشفى' },
  location: { so: 'Goobta / Magaalada', en: 'Location / City', ar: 'الموقع / المدينة' },
  importantNotice: { so: 'Ogeysiis Muhiim ah', en: 'Important Notice', ar: 'تنبيه هام' },
  feeNotice: { so: 'Lacag dhan $0.50 ayaa lagu dalacayaa. Waa inaad siisaa deeq bixiyaha $20 isla markiiba ka dib deeqda.', en: 'A platform fee of $0.50 applies. You must pay the donor $20 immediately after donation.', ar: 'يتم تطبيق رسوم منصة قدرها 0.50 دولار. يجب عليك دفع 20 دولاراً للمتبرع فور التبرع.' },
  posting: { so: 'Waa la soo dhajinayaa...', en: 'Posting...', ar: 'جاري النشر...' },
  senderNumber: { so: 'Lambarka lacagta laga soo diray', en: 'Sender Mobile Money Number', ar: 'رقم مرسل الأموال' },
  whatsappNumber: { so: 'Lambarka WhatsApp-ka', en: 'WhatsApp Number', ar: 'رقم الواتساب' },
  callNumber: { so: 'Lambarka taleefanka (Wicitaanka)', en: 'Phone Number (Calling)', ar: 'رقم الهاتف (للاتصال)' },
  paymentInstructions: { so: 'Fadlan u soo dir $0.50 lambarkan: +252 61 5000000', en: 'Please send $0.50 to this number: +252 61 5000000', ar: 'يرجى إرسال 0.50 دولار إلى هذا الرقم: +252 61 5000000' },
  adminPanel: { so: 'Maamulka', en: 'Admin Panel', ar: 'لوحة التحكم' },
  manageUsers: { so: 'Maamul isticmaalayaasha', en: 'Manage Users', ar: 'إدارة المستخدمين' },
  manageRequests: { so: 'Maamul codsiyada', en: 'Manage Requests', ar: 'إدارة الطلبات' },
  allComplaints: { so: 'Dhammaan cabashooyinka', en: 'All Complaints', ar: 'جميع الشكاوى' },
  banUser: { so: 'Mamnuuc isticmaalaha', en: 'Ban User', ar: 'حظر المستخدم' },
  unbanUser: { so: 'Ka qaad mamnuucista', en: 'Unban User', ar: 'إلغاء حظر المستخدم' },
  verifyUser: { so: 'Xaqiiji isticmaalaha', en: 'Verify User', ar: 'تحقق من المستخدم' },

  // Donation Tracker
  pendingConfirmations: { so: 'Xaqiijinta Sugaysa', en: 'Pending Confirmations', ar: 'تأكيدات معلقة' },
  confirmHandshake: { so: 'Xaqiiji Gacan-qaadka', en: 'Confirm Handshake', ar: 'تأكيد المصافحة' },
  confirmed: { so: 'Waa la xaqiijiyay', en: 'Confirmed', ar: 'تم التأكيد' },
  donorQuestion: { so: 'Miyaad dhamaystirtay deeqda oo aad heshay ugu yaraan $20 nafaqada/gaadiidka?', en: 'Did you complete the donation and receive the minimum $20 for nutrition/transport?', ar: 'هل أكملت التبرع واستلمت 20 دولاراً على الأقل للتغذية/النقل؟' },
  recipientQuestion: { so: 'Miyaad heshay dhiigga oo aad siisay deeq bixiyaha ugu yaraan $20 nafaqada/gaadiidka?', en: 'Did you receive the blood and pay the donor the minimum $20 for nutrition/transport?', ar: 'هل استلمت الدم ودفعت للمتبرع 20 دولاراً على الأقل للتغذية/النقل؟' },

  // Banned
  accountBanned: { so: 'Akoonku waa la xiray', en: 'Account Banned', ar: 'تم حظر الحساب' },
  banReason: { so: 'Akoonkaaga waa la xaddiday sababtoo ah jebinta xeerarka bulshada ama ku guuldareysiga inaad wax ku darsato.', en: 'Your account has been restricted due to a violation of community rules or failure to donate.', ar: 'تم تقييد حسابك بسبب انتهاك قواعد المجتمع أو عدم التبرع.' },
  reinstateNotice: { so: 'Si aad u soo celiso akoonkaaga, ganaax dhan $20 ayaa loo baahan yahay. Fadlan la xiriir Maamulka.', en: 'To reinstate your account, a fine of $20 is required. Please contact Admin.', ar: 'لاستعادة حسابك، مطلوب غرامة قدرها 20 دولاراً. يرجى الاتصال بالمسؤول.' },
  contactSupport: { so: 'La xiriir Taageerada', en: 'Contact Support', ar: 'اتصل بالدعم' },

  // Complaints
  fileComplaint: { so: 'Gudbi Cabasho', en: 'File a Complaint', ar: 'تقديم شكوى' },
  complaintSubtext: { so: 'Kooxda Cabashada ayaa baari doonta deeqdan.', en: 'The Complain Team will investigate this donation.', ar: 'سيقوم فريق الشكاوى بالتحقيق في هذا التبرع.' },
  investigationPolicy: { so: 'Kooxda Cabashada waxay booqan doonaan cusbitaalka. "Qofka khaldan" waxaa lagu ganaaxi doonaa kharashka baaritaanka.', en: 'The Complain Team will visit the hospital. The "wrong person" will be fined for investigation costs.', ar: 'سيقوم فريق الشكاوى بزيارة المستشفى. سيتم تغريم "الشخص المخطئ" بتكاليف التحقيق.' },
  complaintReason: { so: 'Sababta Cabashada', en: 'Reason for Complaint', ar: 'سبب الشكوى' },
  submitting: { so: 'Waa la gudbinayaa...', en: 'Submitting...', ar: 'جاري الإرسال...' },

  // Statuses
  active: { so: 'Firfircoon', en: 'Active', ar: 'نشط' },
  banned: { so: 'La mamnuucay', en: 'Banned', ar: 'محظور' },
  pending_verification: { so: 'Sugaya xaqiijin', en: 'Pending Verification', ar: 'قيد التحقق' },
  
  // Urgency
  low: { so: 'Hoose', en: 'Low', ar: 'منخفض' },
  medium: { so: 'Dhexdhexaad', en: 'Medium', ar: 'متوسط' },
  high: { so: 'Sare', en: 'High', ar: 'عالي' },
  emergency: { so: 'Degdeg ah', en: 'Emergency', ar: 'طوارئ' },

  // Request Status
  open: { so: 'Furan', en: 'Open', ar: 'مفتوح' },
  matched: { so: 'La helay', en: 'Matched', ar: 'تمت المطابقة' },
  completed: { so: 'Dhamaystiran', en: 'Completed', ar: 'مكتمل' },
  cancelled: { so: 'La joojiyay', en: 'Cancelled', ar: 'ملغي' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('so');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
