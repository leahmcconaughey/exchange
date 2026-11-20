# Simple flat illustrations for Exchange covers (viewBox 0 0 200 200).
# Style: navy outline, brand fills. Swap any of these for a ChatGPT illustration later if you like.
N="#0B3A55"; O="#F28C38"; B="#2D8FE0"; S="#9CCB8E"; C="#FCF2E8"; P="#F8CFA3"; Y="#F7C34B"; W="#FFFFFF"; LB="#BFE0F7"
st=f'stroke="{N}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"'
ART = {
"research-series": f'''
 <rect x="38" y="138" width="124" height="24" rx="5" fill="{B}" {st}/><path d="M50 150h80" {st}/>
 <rect x="48" y="112" width="110" height="26" rx="5" fill="{O}" {st}/><path d="M60 125h70" {st}/>
 <rect x="42" y="88" width="116" height="24" rx="5" fill="{S}" {st}/><path d="M56 100h76" {st}/>
 <circle cx="100" cy="48" r="22" fill="{Y}" {st}/><path d="M92 70h16v10h-16z" fill="{C}" {st}/><path d="M100 18v-6M126 30l5-4M74 30l-5-4M136 50h6M64 50h-6" {st}/>''',
"mastery-based-grading": f'''
 <rect x="40" y="30" width="110" height="140" rx="10" fill="{W}" {st}/><rect x="40" y="30" width="110" height="26" rx="10" fill="{LB}" {st}/>
 <path d="M78 56v114M40 90h110M40 124h110" {st}/>
 <circle cx="96" cy="73" r="7" fill="{B}" {st}/><circle cx="116" cy="73" r="7" fill="{O}" {st}/><circle cx="136" cy="73" r="7" fill="{W}" {st}/>
 <circle cx="96" cy="107" r="7" fill="{S}" {st}/><circle cx="116" cy="107" r="7" fill="{B}" {st}/><circle cx="136" cy="107" r="7" fill="{O}" {st}/>
 <circle cx="96" cy="141" r="7" fill="{O}" {st}/><circle cx="116" cy="141" r="7" fill="{W}" {st}/><circle cx="136" cy="141" r="7" fill="{S}" {st}/>
 <path d="M150 120l26-26 12 12-26 26-16 4z" fill="{Y}" {st}/><path d="M146 136l4-16 12 12z" fill="{P}" {st}/>''',
"professional-learning": f'''
 <circle cx="62" cy="80" r="20" fill="{P}" {st}/><path d="M30 152c2-26 16-40 32-40s30 14 32 40z" fill="{B}" {st}/>
 <circle cx="138" cy="80" r="20" fill="{P}" {st}/><path d="M106 152c2-26 16-40 32-40s30 14 32 40z" fill="{S}" {st}/>
 <circle cx="100" cy="66" r="22" fill="{P}" {st}/><path d="M64 160c2-30 18-46 36-46s34 16 36 46z" fill="{O}" {st}/>
''',
"participation-structures": f'''
 <circle cx="100" cy="102" r="40" fill="{P}" {st}/>
 <circle cx="100" cy="40" r="16" fill="{B}" {st}/><circle cx="162" cy="102" r="16" fill="{O}" {st}/>
 <circle cx="100" cy="164" r="16" fill="{S}" {st}/><circle cx="38" cy="102" r="16" fill="{Y}" {st}/>
 <rect x="84" y="88" width="32" height="28" rx="3" fill="{W}" {st}/><path d="M90 98h20M90 106h14" {st}/>''',
"watching-yourself-teach": f'''
 <rect x="26" y="66" width="112" height="78" rx="12" fill="{B}" {st}/><path d="M138 92l38-20v66l-38-20z" fill="{O}" {st}/>
 <circle cx="58" cy="48" r="16" fill="{C}" {st}/><circle cx="104" cy="48" r="16" fill="{C}" {st}/>
 <path d="M70 90v34l28-17z" fill="{W}" {st}/><circle cx="44" cy="80" r="4" fill="#E2483D" stroke="none"/>''',
"learn-the-amt-framework": f'''
 <path d="M24 168h48v-36H24z" fill="{B}" {st}/><path d="M72 168h48v-72H72z" fill="{O}" {st}/><path d="M120 168h50v-110h-50z" fill="{S}" {st}/>
 <text x="48" y="158" font-family="Manrope" font-weight="800" font-size="24" fill="{W}" text-anchor="middle">A</text>
 <text x="96" y="158" font-family="Manrope" font-weight="800" font-size="24" fill="{N}" text-anchor="middle">M</text>
 <text x="145" y="158" font-family="Manrope" font-weight="800" font-size="24" fill="{N}" text-anchor="middle">T</text>
 <path d="M145 58V18" {st}/><path d="M145 20l26 9-26 9z" fill="{O}" {st}/>''',
"staff-meeting-ready": f'''
 <rect x="34" y="36" width="96" height="134" rx="10" fill="{W}" {st}/><rect x="60" y="26" width="44" height="20" rx="6" fill="{B}" {st}/>
 <path d="M50 74l6 6 12-12M78 74h36M50 106l6 6 12-12M78 106h36M50 138l6 6 12-12M78 138h28" {st}/>
 <path d="M134 120h40v34a14 14 0 0 1-14 14h-12a14 14 0 0 1-14-14z" fill="{O}" {st}/><path d="M174 128h6a9 9 0 0 1 0 18h-6" {st}/>
 <path d="M146 108c-4-6 4-10 0-16M160 108c-4-6 4-10 0-16" {st}/>''',
"school-models": f'''
 <path d="M36 92h128v74H36z" fill="{C}" {st}/><path d="M28 96l72-48 72 48z" fill="{O}" {st}/>
 <path d="M100 48V18" {st}/><path d="M100 20h28l-6 9 6 9h-28z" fill="{B}" {st}/>
 <rect x="86" y="128" width="28" height="38" rx="14" fill="{B}" {st}/><circle cx="100" cy="82" r="10" fill="{LB}" {st}/>
 <rect x="48" y="108" width="24" height="22" fill="{LB}" {st}/><rect x="128" y="108" width="24" height="22" fill="{LB}" {st}/>''',
"engagement-blueprint": f'''
 <rect x="30" y="40" width="140" height="120" rx="8" fill="{B}" {st}/>
 <path d="M30 76h140M30 112h140M66 40v120M102 40v120M138 40v120" stroke="#7FC0F0" stroke-width="2"/>
 <rect x="30" y="40" width="140" height="120" rx="8" fill="none" {st}/>
 <path d="M50 136l30-40 26 22 40-50" stroke="{W}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <circle cx="146" cy="68" r="9" fill="{O}" {st}/>
 <path d="M150 150l22-22 10 10-22 22-13 3z" fill="{Y}" {st}/>''',
"coaching-conversation": f'''
 <path d="M26 40h96a10 10 0 0 1 10 10v50a10 10 0 0 1-10 10H70l-24 20v-20H36a10 10 0 0 1-10-10V50a10 10 0 0 1 10-10z" fill="{W}" {st}/>
 <path d="M48 66h62M48 84h40" {st}/>
 <path d="M84 98h82a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10h-10v20l-24-20H84a10 10 0 0 1-10-10v-44a10 10 0 0 1 10-10z" fill="{O}" {st}/>
 <circle cx="104" cy="130" r="5" fill="{N}"/><circle cx="124" cy="130" r="5" fill="{N}"/><circle cx="144" cy="130" r="5" fill="{N}"/>''',
"coaching-chronicles": f'''
 <rect x="34" y="28" width="122" height="146" rx="8" fill="{W}" {st}/>
 <path d="M50 52h90" stroke="{N}" stroke-width="10" stroke-linecap="round"/>
 <rect x="50" y="70" width="44" height="38" rx="4" fill="{S}" {st}/><path d="M54 104l12-14 10 8 14-14" {st}/>
 <path d="M104 74h36M104 88h36M104 102h24M50 126h90M50 142h90M50 158h60" {st}/>
 <path d="M150 140l28-28 12 12-28 28-16 4z" fill="{Y}" {st}/><path d="M146 156l4-16 12 12z" fill="{P}" {st}/>''',
"jigsaw": f'''
 <rect x="30" y="30" width="64" height="64" rx="4" fill="{B}" {st}/><rect x="94" y="30" width="64" height="64" rx="4" fill="{O}" {st}/>
 <rect x="30" y="94" width="64" height="64" rx="4" fill="{S}" {st}/>
 <circle cx="94" cy="62" r="12" fill="{B}" {st}/><path d="M94 49v26" stroke="{B}" stroke-width="7"/>
 <circle cx="62" cy="94" r="12" fill="{B}" {st}/><path d="M49 94h26" stroke="{B}" stroke-width="7"/>
 <g transform="translate(16 16)"><rect x="94" y="94" width="64" height="64" rx="4" fill="{Y}" {st}/><circle cx="94" cy="126" r="12" fill="{Y}" {st}/><path d="M94 113v26" stroke="{Y}" stroke-width="7"/></g>
''',
"share-outs": f'''
 <circle cx="50" cy="128" r="18" fill="{P}" {st}/><path d="M22 186c2-22 12-32 28-32s26 10 28 32" fill="{B}" {st}/>
 <circle cx="100" cy="128" r="18" fill="{P}" {st}/><path d="M72 186c2-22 12-32 28-32s26 10 28 32" fill="{O}" {st}/>
 <circle cx="150" cy="128" r="18" fill="{P}" {st}/><path d="M122 186c2-22 12-32 28-32s26 10 28 32" fill="{S}" {st}/>
 <path d="M30 26h40a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H50l-12 12V68h-8a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" fill="{W}" {st}/>
 <path d="M80 18h40a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-20l-12 12V60h-8a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" fill="{Y}" {st} transform="translate(0 4)"/>
 <path d="M130 26h40a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-8v12l-12-12h-20a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" fill="{LB}" {st}/>''',
"gallery": f'''
 <rect x="22" y="30" width="72" height="56" rx="6" fill="{W}" {st}/><rect x="106" y="30" width="72" height="56" rx="6" fill="{W}" {st}/>
 <rect x="34" y="42" width="22" height="18" fill="{O}" {st}/><path d="M62 46h20M62 56h14M34 72h48" {st}/>
 <rect x="118" y="42" width="22" height="18" fill="{B}" {st}/><path d="M146 46h20M146 56h14M118 72h48" {st}/>
 <circle cx="58" cy="130" r="16" fill="{P}" {st}/><path d="M32 182c2-20 12-30 26-30s24 10 26 30" fill="{S}" {st}/>
 <circle cx="142" cy="130" r="16" fill="{P}" {st}/><path d="M116 182c2-20 12-30 26-30s24 10 26 30" fill="{Y}" {st}/>
 <path d="M84 120h32M106 110l10 10-10 10" {st}/>''',
}
