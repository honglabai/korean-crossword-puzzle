import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "public/backgrounds"
os.makedirs(OUTPUT_DIR, exist_ok=True)
W, H = 1280, 720

# 10 Level Themes with 3 distinct color palettes & structural motifs each
LEVEL_THEMES = {
    1: [ # 기초 민주주의와 선거 (Morning Democratic Plaza & Voting Atrium)
        {"id": "lv1_1", "sky": (224, 242, 254), "ground": (240, 253, 244), "accent": (56, 189, 248), "motif": "plaza_morning", "name": "햇살 비치는 민주주의 광장"},
        {"id": "lv1_2", "sky": (254, 249, 195), "ground": (254, 243, 199), "accent": (245, 158, 11), "motif": "citizen_study", "name": "헌법 제1조 시민의 서재"},
        {"id": "lv1_3", "sky": (204, 251, 241), "ground": (236, 253, 245), "accent": (20, 184, 166), "motif": "voting_pavilion", "name": "희망찬 투표소 파빌리온"},
    ],
    2: [ # 의회 운영 및 행정 기본 (Plenary Assembly Dome & Committee Chambers)
        {"id": "lv2_1", "sky": (219, 234, 254), "ground": (241, 245, 249), "accent": (59, 130, 246), "motif": "assembly_dome", "name": "국회 본회의장 원형 돔"},
        {"id": "lv2_2", "sky": (254, 243, 199), "ground": (245, 239, 230), "accent": (180, 83, 9), "motif": "committee_hall", "name": "상임위원회 심사 회의실"},
        {"id": "lv2_3", "sky": (224, 231, 255), "ground": (238, 242, 255), "accent": (99, 102, 241), "motif": "assembly_library", "name": "국회도서관 중앙 회랑"},
    ],
    3: [ # 헌법기관 및 정부 형태 (Constitutional Court & Justice Atrium)
        {"id": "lv3_1", "sky": (236, 253, 245), "ground": (241, 245, 249), "accent": (16, 185, 129), "motif": "court_pillars", "name": "헌법재판소 대심판정 회랑"},
        {"id": "lv3_2", "sky": (243, 244, 246), "ground": (229, 231, 235), "accent": (107, 114, 128), "motif": "tripartite_arch", "name": "삼권분립 대리석 아치"},
        {"id": "lv3_3", "sky": (241, 245, 249), "ground": (248, 250, 252), "accent": (71, 85, 105), "motif": "justice_hall", "name": "정의의 전당 열주랑"},
    ],
    4: [ # 선거 제도와 정당 정치 실무 (Election Campaign & Convention Hall)
        {"id": "lv4_1", "sky": (254, 242, 242), "ground": (248, 250, 252), "accent": (239, 68, 68), "motif": "election_situation", "name": "선거 종합상황실"},
        {"id": "lv4_2", "sky": (238, 242, 255), "ground": (245, 243, 255), "accent": (99, 102, 241), "motif": "party_convention", "name": "정당 전당대회 메인홀"},
        {"id": "lv4_3", "sky": (255, 247, 237), "ground": (254, 243, 199), "accent": (249, 115, 22), "motif": "policy_desk", "name": "공천 관리 정책 집무실"},
    ],
    5: [ # 비교정치와 정치학 개론 (Comparative Politics Classic Library)
        {"id": "lv5_1", "sky": (254, 243, 199), "ground": (235, 225, 210), "accent": (180, 83, 9), "motif": "global_archive", "name": "세계 의회 비교정치 서고"},
        {"id": "lv5_2", "sky": (245, 235, 220), "ground": (230, 215, 195), "accent": (146, 64, 14), "motif": "classic_salon", "name": "정치철학 고전 아카데미"},
        {"id": "lv5_3", "sky": (250, 245, 235), "ground": (235, 228, 215), "accent": (161, 98, 7), "motif": "oxford_atrium", "name": "비교 거버넌스 열람실"},
    ],
    6: [ # 입법 절차 및 권력 간 견제 (Legislative Chamber & Hearing Room)
        {"id": "lv6_1", "sky": (254, 242, 242), "ground": (245, 235, 235), "accent": (185, 28, 28), "motif": "speaker_gavel", "name": "의사봉과 법률안 의장석"},
        {"id": "lv6_2", "sky": (241, 245, 249), "ground": (235, 240, 245), "accent": (51, 65, 85), "motif": "hearing_chamber", "name": "국정감사 대청문회장"},
        {"id": "lv6_3", "sky": (245, 243, 255), "ground": (238, 235, 248), "accent": (126, 34, 206), "motif": "judiciary_review", "name": "법제사법위원회 심사실"},
    ],
    7: [ # 국제정치와 외교안보 이론 (Diplomatic Summit & Peace Assembly)
        {"id": "lv7_1", "sky": (224, 242, 254), "ground": (240, 249, 255), "accent": (2, 132, 199), "motif": "diplomatic_summit", "name": "다자간 정상외교 라운지"},
        {"id": "lv7_2", "sky": (219, 234, 254), "ground": (230, 240, 250), "accent": (37, 99, 235), "motif": "un_peace_hall", "name": "국제연합 평화의 전당"},
        {"id": "lv7_3", "sky": (254, 243, 199), "ground": (245, 240, 230), "accent": (217, 119, 6), "motif": "treaty_room", "name": "역사적 조약 비준 집무실"},
    ],
    8: [ # 정치사상과 민주주의 심화 (Philosophy Forum & Classical Agora)
        {"id": "lv8_1", "sky": (254, 249, 195), "ground": (245, 235, 215), "accent": (202, 138, 4), "motif": "enlightenment_study", "name": "계몽주의 사회계약론 서재"},
        {"id": "lv8_2", "sky": (224, 242, 254), "ground": (240, 245, 240), "accent": (14, 165, 233), "motif": "agora_colonnade", "name": "아테네 아고라 민주주의 회랑"},
        {"id": "lv8_3", "sky": (250, 245, 255), "ground": (240, 235, 248), "accent": (147, 51, 234), "motif": "deliberative_forum", "name": "현대 숙의민주주의 공론장"},
    ],
    9: [ # 제도론과 행태론 심화 (Institutional Analytics & Big Data Lab)
        {"id": "lv9_1", "sky": (224, 231, 255), "ground": (241, 245, 249), "accent": (79, 70, 229), "motif": "electoral_analytics", "name": "선거행태 빅데이터 분석실"},
        {"id": "lv9_2", "sky": (243, 244, 246), "ground": (235, 238, 242), "accent": (75, 85, 99), "motif": "institutional_archive", "name": "신제도주의 정책 아카이브"},
        {"id": "lv9_3", "sky": (238, 242, 255), "ground": (230, 235, 248), "accent": (67, 56, 202), "motif": "game_theory_desk", "name": "합리적 선택 게임이론 연구실"},
    ],
    10: [ # 정치학 최고 권위자 특수 심화 (Presidential Archives & Grand Master Hall)
        {"id": "lv10_1", "sky": (254, 243, 199), "ground": (238, 228, 212), "accent": (180, 83, 9), "motif": "presidential_archives", "name": "대통령 기록관 헌정의 전당"},
        {"id": "lv10_2", "sky": (245, 235, 255), "ground": (235, 225, 245), "accent": (126, 34, 206), "motif": "supreme_academy", "name": "정치학 석학 최고 평의회"},
        {"id": "lv10_3", "sky": (254, 240, 220), "ground": (240, 225, 210), "accent": (194, 65, 12), "motif": "constitutional_council", "name": "최고 헌법 평의원 회의장"},
    ],
}

def create_themed_artwork(cfg):
    # Base watercolor canvas
    img = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # 1. Atmospheric sky to ground gradient
    sky_c = cfg["sky"]
    gnd_c = cfg["ground"]
    acc_c = cfg["accent"]

    # Generate smooth gradient array
    grad = np.zeros((H, W, 4), dtype=np.uint8)
    for y in range(H):
        t = y / float(H)
        # Smooth ease curve
        t_curve = t * t * (3 - 2 * t)
        r = int(sky_c[0] * (1 - t_curve) + gnd_c[0] * t_curve)
        g = int(sky_c[1] * (1 - t_curve) + gnd_c[1] * t_curve)
        b = int(sky_c[2] * (1 - t_curve) + gnd_c[2] * t_curve)
        grad[y, :, 0] = r
        grad[y, :, 1] = g
        grad[y, :, 2] = b
        grad[y, :, 3] = 255

    base_layer = Image.fromarray(grad)

    # 2. Architectural Structure Layer (Watercolored Arches, Pillars & Bookcase silhouettes)
    arch_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    arch_draw = ImageDraw.Draw(arch_layer)

    motif = cfg["motif"]

    # Soft translucent watercolor architectural lines
    arch_color = (acc_c[0], acc_c[1], acc_c[2], 26)
    beam_color = (acc_c[0], acc_c[1], acc_c[2], 34)
    pillar_color = (acc_c[0], acc_c[1], acc_c[2], 20)

    # Symmetrical grand arches
    for i in range(4):
        # Left and Right Arches
        cx_left = 180 + i * 160
        cx_right = W - (180 + i * 160)
        arch_w = 90
        # Left Arch
        arch_draw.arc([cx_left - arch_w, 40, cx_left + arch_w, 360], 180, 360, fill=arch_color, width=3)
        arch_draw.line([cx_left - arch_w, 200, cx_left - arch_w, H - 40], fill=pillar_color, width=4)
        arch_draw.line([cx_left + arch_w, 200, cx_left + arch_w, H - 40], fill=pillar_color, width=4)
        # Right Arch
        arch_draw.arc([cx_right - arch_w, 40, cx_right + arch_w, 360], 180, 360, fill=arch_color, width=3)
        arch_draw.line([cx_right - arch_w, 200, cx_right - arch_w, H - 40], fill=pillar_color, width=4)
        arch_draw.line([cx_right + arch_w, 200, cx_right + arch_w, H - 40], fill=pillar_color, width=4)

    # Central Majestic Arch / Rotunda Dome
    arch_draw.arc([W//2 - 280, 20, W//2 + 280, 480], 180, 360, fill=beam_color, width=4)
    arch_draw.arc([W//2 - 220, 50, W//2 + 220, 440], 180, 360, fill=arch_color, width=3)

    # Soft perspective floor lines
    vanishing_y = 380
    for vx in range(100, W, 120):
        arch_draw.line([W//2, vanishing_y, vx, H], fill=(acc_c[0], acc_c[1], acc_c[2], 16), width=2)

    # Classical Cornices & Horizontal Moldings
    arch_draw.line([0, 160, W, 160], fill=beam_color, width=3)
    arch_draw.line([0, 175, W, 175], fill=pillar_color, width=2)
    arch_draw.line([0, 480, W, 480], fill=beam_color, width=2)

    # 3. Soft Ambient Watercolor Wash Blur
    arch_layer = arch_layer.filter(ImageFilter.GaussianBlur(radius=1.8))

    # Composite
    final_img = Image.alpha_composite(base_layer, arch_layer)

    # 4. Subtle Vignette & Sunlight Ray Beam
    sun_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sun_draw = ImageDraw.Draw(sun_layer)
    # Gentle sunbeam from top left
    sun_draw.polygon([(0, 0), (380, 0), (620, H), (140, H)], fill=(255, 255, 240, 25))
    sun_layer = sun_layer.filter(ImageFilter.GaussianBlur(radius=15.0))
    final_img = Image.alpha_composite(final_img, sun_layer)

    # Convert to RGB
    rgb_img = final_img.convert("RGB")

    # Temporary PNG to pass to cwebp for ultimate ultra-low-weight WebP encoding
    temp_png = f"/tmp/{cfg['id']}.png"
    rgb_img.save(temp_png, "PNG")

    # Encode with cwebp at quality 78 (high visual fidelity + tiny byte weight ~40KB)
    webp_path = os.path.join(OUTPUT_DIR, f"{cfg['id']}.webp")
    cmd = [
        "cwebp",
        "-q", "78",
        "-m", "6",
        "-af",
        temp_png,
        "-o", webp_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    os.remove(temp_png)

    size_kb = os.path.getsize(webp_path) / 1024.0
    return webp_path, size_kb

print("Generating 30 Level-Themed Ultra-Lightweight WebP Backgrounds...")
all_manifest = {}
total_kb = 0

for lvl, variants in LEVEL_THEMES.items():
    all_manifest[lvl] = []
    for var in variants:
        path, kb = create_themed_artwork(var)
        rel_path = f"/backgrounds/{var['id']}.webp"
        all_manifest[lvl].append({
            "id": var["id"],
            "url": rel_path,
            "name": var["name"],
            "sizeKb": round(kb, 1)
        })
        total_kb += kb
        print(f"Level {lvl}: {var['name']} -> {rel_path} ({kb:.1f} KB)")

print(f"\nSuccessfully generated 30 WebP backgrounds! Total combined size: {total_kb:.1f} KB (Avg: {total_kb/30:.1f} KB/image)")

# Also save metadata manifest
import json
with open("src/data/backgroundManifest.json", "w", encoding="utf-8") as f:
    json.dump(all_manifest, f, ensure_ascii=False, indent=2)
print("Saved manifest to src/data/backgroundManifest.json")
