import sys
sys.path.insert(0, r'd:\imp\azx\projects\Multi-Modal Detection')
from backend.models.fake_news_model import predict_text

CASES = [
    ("Ronaldo won WC (FALSE CLAIM)",
     "Cristiano Ronaldo has won world cup in 2022."),
    ("Vaccine study (TRUE CLAIM)",
     "According to a study published in the New England Journal of Medicine, "
     "researchers at Harvard University found that the new vaccine shows 94% efficacy "
     "against severe disease. The clinical trial involved 43,000 participants across "
     "six countries. Health officials confirmed the results and announced the policy "
     "update on Tuesday."),
    ("5G conspiracy (FAKE NEWS)",
     "SHOCKING: Scientists BANNED from revealing the truth about 5G towers and vaccines! "
     "The government doesn't want you to know that mainstream media is LYING to you. "
     "Wake up sheeple — this exclusive bombshell exposes the deep state cover-up that "
     "will destroy everything you thought you knew! Share before it's CENSORED!"),
]

for name, text in CASES:
    r = predict_text(text, use_web=True)
    we = r.get('web_evidence') or {}
    print(f"\n{'='*62}")
    print(f"  {name}")
    print(f"{'='*62}")
    print(f"  Verdict        : {r['label']}  ({round(r['confidence']*100)}%)")
    print(f"  Ling fake prob : {round((r.get('linguistic_score') or 0)*100)}%")
    print(f"  Web label      : {we.get('web_label','N/A')}  score={we.get('web_score','N/A')}")
    print(f"  High cred      : {we.get('high_cred_count',0)}  confirming={we.get('confirming_cred_count',0)}")
    print(f"  Debunk / Confirm: {we.get('debunk_count',0)} / {we.get('confirm_count',0)}")
    print(f"  Sources found  : {len(we.get('sources',[]))}")
    print(f"  Web summary    : {we.get('web_summary','')[:110]}")
