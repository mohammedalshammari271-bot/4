/**
 * الأسئلة الوزارية حول الاستبدال
 * المصدر: الصفحتان المطبوعتان 53-54
 * قاعدة العد: كل صيغة وزارية مستقلة لها سنة/دور مختلف أو تعليمات مختلفة تُحفظ كسؤال مستقل.
 */

export interface Question {
  id: string;
  sourcePage: number;
  sourceActivityOrder: number;
  sourceItemOrder: number;
  sourceActivityLabel: string;
  sourceType: string;
  year: string;
  type: "poetry" | "quran" | "prose";
  verse?: string;
  poetryLines?: { first: string; second: string }[];
  text: string;
  modelAnswer: string;
}

export const QUESTIONS_DATA: Question[] = [
  {
    id: "p53-q01",
    sourcePage: 53,
    sourceActivityOrder: 1,
    sourceItemOrder: 1,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الثاني (١٩٩٣)",
    type: "prose",
    verse: "سأل الجاحظ أمه عن طعام فقالت له: «ليس عندي من طعام غير هذه الكراريس فدعيك بها، فذهب مفتنّاً إلى صاحبه فأعطاه ثمن الدقيق، فسألته أمه: من أين لك هذا؟ قال: من الكراريس».",
    text: "استبدل باسم الاستفهام (من أين لك هذا) اسماً آخر بمعناه.",
    modelAnswer: "أَنّى لك هذا؟"
  },
  {
    id: "p53-q02",
    sourcePage: 53,
    sourceActivityOrder: 1,
    sourceItemOrder: 2,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الأول (٢٠٠٨)",
    type: "poetry",
    poetryLines: [
      { first: "ولولا سبيلُ سنَّها الشعرُ ما دَرِي", second: "بقاءُ العُلا من أين تؤتى المكارمُ" }
    ],
    text: "بإمكانك وضع أداة استفهام بدل المذكورة تشبهها بالمعنى.",
    modelAnswer: "أَنّى تؤتى المكارمُ؟"
  },
  {
    id: "p53-q03",
    sourcePage: 53,
    sourceActivityOrder: 1,
    sourceItemOrder: 3,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الأول (٢٠١٤)",
    type: "poetry",
    poetryLines: [
      { first: "بِمَن يثقُ الإنسانُ فيما ينوبه", second: "ومن أينَ للحُرِّ الكريمِ صحابي؟" }
    ],
    text: "بإمكانك وضع أداة استفهام بدل المذكورة في الشطر الثاني تشبهها في المعنى.",
    modelAnswer: "وَأَنّى للحُرِّ الكريمِ صحابي؟"
  },
  {
    id: "p53-q04",
    sourcePage: 53,
    sourceActivityOrder: 1,
    sourceItemOrder: 4,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الأول (٢٠١٦) — أسئلة المؤجلين",
    type: "poetry",
    poetryLines: [
      { first: "بِمَن يثقُ الإنسانُ فيما ينوبه", second: "ومن أينَ للحُرِّ الكريمِ صحابي؟" }
    ],
    text: "أبدل (من أين) باسم استفهام مشابه له في المعنى.",
    modelAnswer: "وَأَنّى للحُرِّ الكريمِ صحابي؟"
  },
  {
    id: "p53-q05",
    sourcePage: 53,
    sourceActivityOrder: 1,
    sourceItemOrder: 5,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الأول (٢٠١٥)",
    type: "poetry",
    poetryLines: [
      { first: "واستقرني التاريخُ كيف تألقت", second: "قممُ البيانِ بدجلةَ الهدّارِ" }
    ],
    text: "استبدل باسم الاستفهام اسماً آخر معرباً يعرب مفعولاً مطلقاً، مغيراً ما يلزم.",
    modelAnswer: "أيَّ تألُّقٍ تألقتْ قممُ البيانِ بدجلةَ الهدّارِ؟"
  },
  {
    id: "p54-q01",
    sourcePage: 54,
    sourceActivityOrder: 1,
    sourceItemOrder: 1,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الثاني (٢٠١٧)",
    type: "prose",
    verse: "تدريب على اسم الاستفهام (أَنّى).",
    text: "هات جملتين تكون أداة الاستفهام في كل منهما (أَنّى)، واستوفِ المعاني التي عُرفت لهذه الأداة.",
    modelAnswer: "مثالان صحيحان: ١) أَنّى ينجحُ المهملُ؟ ومعناها: كيف. ٢) أَنّى لك هذا المالُ؟ ومعناها: من أين أو أين."
  },
  {
    id: "p54-q02",
    sourcePage: 54,
    sourceActivityOrder: 1,
    sourceItemOrder: 2,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الثالث (٢٠١٧) — أسئلة الموصل",
    type: "prose",
    verse: "تدريب على اسم الاستفهام (أَنّى).",
    text: "أدخل (أَنّى) في جملتين مختلفتين تدلان على معنيين مختلفين، ثم اذكر معناها.",
    modelAnswer: "مثالان صحيحان: ١) أَنّى ينجحُ المهملُ؟ ومعناها: كيف. ٢) أَنّى لك هذا المالُ؟ ومعناها: من أين أو أين."
  },
  {
    id: "p54-q03",
    sourcePage: 54,
    sourceActivityOrder: 1,
    sourceItemOrder: 3,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الثاني (٢٠٢٠) — تطبيقي",
    type: "poetry",
    poetryLines: [
      { first: "يا سائلي أينَ حلَّ الجودُ والكرمُ", second: "عندي بيانٌ إذا طُلابُه قدموا" }
    ],
    text: "استبدل (اسم الاستفهام) باسم استفهام آخر معرب بمعناه.",
    modelAnswer: "أيُّ مكانٍ حلَّ الجودُ؟ ويُقبل: أيُّ جهةٍ حلَّ الجودُ؟"
  },
  {
    id: "p54-q04",
    sourcePage: 54,
    sourceActivityOrder: 1,
    sourceItemOrder: 4,
    sourceActivityLabel: "الأسئلة الوزارية حول الاستبدال",
    sourceType: "وزاريات",
    year: "الدور الأول (٢٠٢١) — تطبيقي",
    type: "poetry",
    poetryLines: [
      { first: "لأيِّ خليلٍ في الزمانِ أرافقُ", second: "وأكثرُ من لقيتُ حبٌّ منافقُ" }
    ],
    text: "ما دلالة (أي)؟ وما إعرابها؟ ولماذا؟ ثم استبدلها باسم آخر بمعناها.",
    modelAnswer: "دلالة (أي): للعاقل. إعرابها: اسم استفهام مجرور وعلامة جره الكسرة، وهو مضاف؛ لأنها سبقت بحرف الجر (اللام). استبدالها: تُستبدل بـ(مَن) الاستفهامية."
  }
];
