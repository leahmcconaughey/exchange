"""Builds Exchange covers (1600x800) in the house template: tag pill, title, underline, meta line, illustration in a circle.
Run: python3 tools/covermaker/make_covers.py   (needs playwright + Chrome)"""
import asyncio, os, html, sys
sys.path.insert(0, os.path.dirname(__file__))
from art import ART
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FONT = os.path.join(ROOT, "tools")
TONES = {  # bg, text, pill bg, pill text, underline, circle
 "navy":  ("#05415B","#FFFFFF","#F2A766","#05415B","#F2A766","#FCF2E8"),
 "orange":("#F2A766","#05415B","#05415B","#FFFFFF","#FFFFFF","#FCF2E8"),
 "peach": ("#F8CFA3","#05415B","#05415B","#FFFFFF","#038FDD","#FCF2E8"),
 "sage":  ("#BFDCC2","#05415B","#FFFFFF","#05415B","#038FDD","#FCF2E8"),
 "sky":   ("#DDEEFA","#05415B","#FCF2E8","#05415B","#038FDD","#FFFFFF"),
 "blue":  ("#038FDD","#FFFFFF","#FCF2E8","#05415B","#FFFFFF","#FCF2E8"),
 "cream": ("#FCF2E8","#05415B","#DDEEFA","#05415B","#F2A766","#F8CFA3"),
}
COVERS = [
 # (output path, tone, tag, title, meta, art)
 ("covers/collections/research-series.png","navy","Original Research","Research Series","6 Slideshows | Leaders and Coaches","research-series"),
 ("covers/collections/mastery-based-grading.png","orange","Video Series","Mastery-Based Grading","Start Here + 5 Videos","mastery-based-grading"),
 ("covers/collections/professional-learning.png","sage","Teachers Learning Together","Professional Learning","Learning Walks | Coaching | Peer Visits","professional-learning"),
 ("covers/collections/participation-structures.png","peach","One-Pagers","Participation Structures","Group Work | Share-Outs","participation-structures"),
 ("covers/collections/watching-yourself-teach.png","sky","The Replay Effect","Watching Yourself Teach","Video | Reflection","watching-yourself-teach"),
 ("covers/collections/learn-the-amt-framework.png","navy","Curated Collection","Learn the AMT Framework","Acquisition | Meaning Making | Transfer","learn-the-amt-framework"),
 ("covers/collections/staff-meeting-ready.png","orange","Curated Collection","Staff Meeting Ready","Stories for Teams","staff-meeting-ready"),
 ("covers/collections/school-models.png","sky","See It in Schools","Competency\u2011Based School Models","School Visits | Redesign","school-models"),
 ("covers/collections/engagement-blueprint.png","peach","Curated Collection","Explore the Engagement Blueprint","Guides | Stories","engagement-blueprint"),
 ("covers/collections/coaching-conversation.png","sage","Curated Collection","Coaching Conversation","Stories to Talk About","coaching-conversation"),
 ("covers/collections/coaching-chronicles.png","blue","From a Farmington Coach","Coaching Chronicles","Monthly Newsletter | Instructional Nudges","coaching-chronicles"),
 ("covers/69-The-Jigsaw-Putting-the-Pieces-Together.png","peach","Participation Structures","The Jigsaw","One-Pager | Small Groups","jigsaw"),
 ("covers/70-Hope-Is-Not-a-Strategy-Designing-Share-Outs-So-Everyone-Thinks.png","sky","Participation Structures","Hope Is Not a Strategy","One-Pager | Share-Outs","share-outs"),
 ("covers/71-No-More-Back-to-Back-Presentations-A-Better-Way-to-Share-Out.png","orange","Participation Structures","No More Back-to-Back Presentations","One-Pager | Share-Outs","gallery"),
]
def page(tone, tag, title, meta, art):
    bg,fg,pb,pf,ul,circ = TONES[tone]
    metah = ' <span class="sep">|</span> '.join(html.escape(m.strip()) for m in meta.split("|"))
    size = 104 if len(title)<=22 else 92 if len(title)<=27 else 82
    return f"""<!doctype html><html><head><style>
@font-face{{font-family:Manrope;src:url('file://{FONT}/Manrope-VariableFont_wght.ttf');font-weight:200 800}}
*{{margin:0;box-sizing:border-box}} body{{width:1600px;height:800px;overflow:hidden;background:{bg};font-family:Manrope;color:{fg};position:relative}}
.txt{{position:absolute;left:100px;top:0;bottom:0;width:740px;display:flex;flex-direction:column;justify-content:center}}
.pill{{align-self:flex-start;background:{pb};color:{pf};font-weight:800;font-size:27px;letter-spacing:.09em;text-transform:uppercase;padding:14px 30px;border-radius:40px}}
h1{{font-size:{size}px;line-height:1.06;font-weight:800;letter-spacing:-.02em;margin:34px 0 0}}
.ul{{width:220px;height:9px;border-radius:9px;background:{ul};margin:38px 0 30px}}
.meta{{font-size:34px;font-weight:600}} .sep{{opacity:.6;margin:0 12px;font-weight:400}}
.circ{{position:absolute;right:-60px;top:50%;transform:translateY(-50%);width:760px;height:760px;border-radius:50%;background:{circ}}}
svg{{position:absolute;right:120px;top:50%;transform:translateY(-50%);width:480px;height:480px}}
</style></head><body><div class="circ"></div>
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">{ART[art]}</svg>
<div class="txt"><div class="pill">{html.escape(tag)}</div><h1>{html.escape(title)}</h1><div class="ul"></div><div class="meta">{metah}</div></div></body></html>"""
async def main(only=None):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox","--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width":1600,"height":800})
        for out,tone,tag,title,meta,art in COVERS:
            if only and only not in out: continue
            path = os.path.join(ROOT,out); os.makedirs(os.path.dirname(path),exist_ok=True)
            tmp = "/tmp/_cover.html"; open(tmp,"w").write(page(tone,tag,title,meta,art))
            await pg.goto("file://"+tmp); await pg.wait_for_timeout(150)
            await pg.screenshot(path=path); print("made", out)
        await b.close()
asyncio.run(main(sys.argv[1] if len(sys.argv)>1 else None))
