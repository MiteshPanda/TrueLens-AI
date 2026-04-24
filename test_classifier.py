import sys
sys.path.insert(0, r'd:\imp\azx\projects\Multi-Modal Detection')
from backend.models.deepfake_model import predict_image

tests = [
    (r'd:\imp\azx\projects\Multi-Modal Detection\test\grizzy.jpg', 'grizzy.jpg'),
    (r'd:\imp\azx\projects\Multi-Modal Detection\test\img.jpg',    'img.jpg'),
]

for path, name in tests:
    with open(path, 'rb') as f:
        data = f.read()
    r = predict_image(data, name)
    pct = round(r['confidence'] * 100)
    print(f"\n{name}:  {r['label']}  ({pct}%)  [{r['model_used']}]")
    print(f"  {r['explanation']}")
