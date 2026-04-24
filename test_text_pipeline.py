import sys
sys.path.insert(0, r'd:\imp\azx\projects\Multi-Modal Detection')
from backend.models.fake_news_model import predict_text

REAL_TEXT = """According to a study published in the New England Journal of Medicine,
researchers at Harvard University found that the new vaccine shows 94% efficacy against
severe disease. The clinical trial involved 43,000 participants across six countries.
Health officials confirmed the results and announced the policy update on Tuesday."""

FAKE_TEXT = """SHOCKING: Scientists BANNED from revealing the truth about 5G towers and vaccines!
The government doesn't want you to know that mainstream media is LYING to you.
Wake up sheeple — this exclusive bombshell exposes the deep state cover-up that will
destroy everything you thought you knew! Share before it's CENSORED!"""

for label, text in [("REAL sample", REAL_TEXT), ("FAKE sample", FAKE_TEXT)]:
    print(f"\n{'='*60}")
    print(f"Testing: {label}")
    r = predict_text(text, use_web=True)
    we = r.get('web_evidence') or {}
    print(f"  Verdict   : {r['label']}  ({round(r['confidence']*100)}%)")
    print(f"  Model     : {r['model_used']}")
    print(f"  Ling score: {round((r.get('linguistic_score') or 0)*100)}% fake")
    print(f"  Web label : {we.get('web_label', 'N/A')}  (web_score={we.get('web_score', 'N/A')})")
    print(f"  Sources   : {len(we.get('sources', []))} found  (high={we.get('high_cred_count',0)}, low={we.get('low_cred_count',0)})")
    print(f"  Web sum   : {we.get('web_summary','')[:120]}")
    print(f"  Explain   : {r['explanation'][:180]}")
