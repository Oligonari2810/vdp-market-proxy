import { useState, useEffect, useCallback, useRef } from "react";

const PROXY = "https://vdp-market-proxy-o1r9du18a-oligonari2810s-projects.vercel.app";

const CFG = {
  thresholds: { go: 80, goCond: 64, watch: 49 },
  filterKeys: ["f1","f2","f3","f4","f5","f6","f7","f8"],
  exchanges: [
    {code:"NYSE",label:"NYSE"},{code:"NASDAQ",label:"NASDAQ"},
    {code:"LSE",label:"LSE London"},{code:"OMX",label:"OMX Stockholm"},
    {code:"ASX",label:"ASX Sydney"},{code:"TSX",label:"TSX Toronto"},
    {code:"XETRA",label:"XETRA Frankfurt"},{code:"EURONEXT",label:"Euronext"},
    {code:"HKEX",label:"HKEX Hong Kong"},{code:"BME",label:"BME Madrid"},
  ],
  sectors: [
    {
      key:"industrial",active:true,icon:"⛏",
      names:{es:"Industrial / Minería",en:"Industrial / Mining"},
      expertise:{en:"expert in industrial companies, mining equipment, capital goods, commodity supercycles. Focus on order backlog, aftermarket revenue, capex cycles, commodity demand."},
      weights:{f1:2.0,f2:1.5,f3:1.5,f4:1.5,f5:1.0,f6:1.0,f7:1.0,f8:1.0},
      disqualifier:"f1",
      filterNames:{
        f1:{es:"F1 — Deuda",en:"F1 — Debt"},f2:{es:"F2 — Valoración",en:"F2 — Valuation"},
        f3:{es:"F3 — Ciclo Sectorial",en:"F3 — Sector Cycle"},f4:{es:"F4 — Gestión Capital",en:"F4 — Capital Mgmt"},
        f5:{es:"F5 — Barreras de Entrada",en:"F5 — Moats"},f6:{es:"F6 — Macro / Commodities",en:"F6 — Macro / Commodities"},
        f7:{es:"F7 — Catalizadores",en:"F7 — Catalysts"},f8:{es:"F8 — ESG Real",en:"F8 — Real ESG"},
      }
    },
    {
      key:"technology",active:true,icon:"💻",
      names:{es:"Tecnología / SaaS",en:"Technology / SaaS"},
      expertise:{en:"expert in technology and software. Focus on ARR, NRR, TAM, network effects. Tech moat is critical."},
      weights:{f1:1.5,f2:1.5,f3:1.0,f4:1.5,f5:2.0,f6:1.0,f7:1.5,f8:0.5},
      disqualifier:"f5",
      filterNames:{
        f1:{es:"F1 — Burn Rate / Deuda",en:"F1 — Burn Rate / Debt"},f2:{es:"F2 — Valoración",en:"F2 — Valuation"},
        f3:{es:"F3 — Ciclo Adopción",en:"F3 — Adoption Cycle"},f4:{es:"F4 — Eficiencia (Rule of 40)",en:"F4 — Efficiency (Rule of 40)"},
        f5:{es:"F5 — Moat Tecnológico",en:"F5 — Tech Moat"},f6:{es:"F6 — Macro / Regulación",en:"F6 — Macro / Regulation"},
        f7:{es:"F7 — Roadmap",en:"F7 — Roadmap"},f8:{es:"F8 — ESG / Gobernanza",en:"F8 — ESG / Governance"},
      }
    },
    {
      key:"healthcare",active:true,icon:"🏥",
      names:{es:"Salud / Farmacéutico",en:"Healthcare / Pharma"},
      expertise:{en:"expert in healthcare and pharma. Focus on pipeline Phase I/II/III, patent cliff, FDA/EMA approvals, revenue mix."},
      weights:{f1:1.5,f2:1.5,f3:2.0,f4:1.5,f5:1.0,f6:1.5,f7:1.0,f8:1.0},
      disqualifier:"f3",
      filterNames:{
        f1:{es:"F1 — Deuda",en:"F1 — Debt"},f2:{es:"F2 — Valoración",en:"F2 — Valuation"},
        f3:{es:"F3 — Pipeline / Patent Cliff",en:"F3 — Pipeline / Patent Cliff"},f4:{es:"F4 — Gestión Capital",en:"F4 — Capital Mgmt"},
        f5:{es:"F5 — Competencia",en:"F5 — Competition"},f6:{es:"F6 — Regulación / FDA",en:"F6 — Regulation / FDA"},
        f7:{es:"F7 — Catalizadores Clínicos",en:"F7 — Clinical Catalysts"},f8:{es:"F8 — ESG / Ética",en:"F8 — ESG / Ethics"},
      }
    },
    {
      key:"financial",active:true,icon:"🏦",
      names:{es:"Financiero / Bancos",en:"Financial / Banks"},
      expertise:{en:"expert in banking. Focus on NIM, CET1 ratio, NPL, ROE vs CoE. High leverage is the business model."},
      weights:{f1:1.0,f2:1.5,f3:1.0,f4:2.0,f5:1.0,f6:1.5,f7:1.0,f8:1.5},
      disqualifier:"f4",
      filterNames:{
        f1:{es:"F1 — Calidad de Activos",en:"F1 — Asset Quality"},f2:{es:"F2 — Valoración",en:"F2 — Valuation"},
        f3:{es:"F3 — Ciclo de Tipos",en:"F3 — Rate Cycle"},f4:{es:"F4 — Capital (CET1)",en:"F4 — Capital (CET1)"},
        f5:{es:"F5 — Competencia / Fintechs",en:"F5 — Competition / Fintechs"},f6:{es:"F6 — Macro / Regulación",en:"F6 — Macro / Regulation"},
        f7:{es:"F7 — Catalizadores",en:"F7 — Catalysts"},f8:{es:"F8 — ESG / Gobernanza",en:"F8 — ESG / Governance"},
      }
    },
    {
      key:"energy",active:true,icon:"⚡",
      names:{es:"Energía / Oil & Gas",en:"Energy / Oil & Gas"},
      expertise:{en:"expert in energy companies. Focus on reserve replacement, F&D costs, oil breakeven, dividend sustainability, energy transition."},
      weights:{f1:2.0,f2:1.5,f3:2.0,f4:1.5,f5:1.0,f6:1.0,f7:1.0,f8:0.5},
      disqualifier:"f1",
      filterNames:{
        f1:{es:"F1 — Deuda / Breakeven",en:"F1 — Debt / Breakeven"},f2:{es:"F2 — Valoración",en:"F2 — Valuation"},
        f3:{es:"F3 — Ciclo Commodities",en:"F3 — Commodity Cycle"},f4:{es:"F4 — Gestión Capital",en:"F4 — Capital Mgmt"},
        f5:{es:"F5 — Competencia",en:"F5 — Competition"},f6:{es:"F6 — Macro / Geopolítica",en:"F6 — Macro / Geopolitics"},
        f7:{es:"F7 — Reservas / Transición",en:"F7 — Reserves / Transition"},f8:{es:"F8 — ESG / Huella",en:"F8 — ESG / Footprint"},
      }
    },
    {
      key:"general",active:true,icon:"🌐",
      names:{es:"General / Multisector",en:"General / Multi-sector"},
      expertise:{en:"expert financial analyst across all sectors. Adapt your framework to the specific industry."},
      weights:{f1:1.5,f2:1.5,f3:1.0,f4:1.5,f5:1.0,f6:1.0,f7:1.0,f8:1.0},
      disqualifier:"f1",
      filterNames:{
        f1:{es:"F1 — Deuda",en:"F1 — Debt"},f2:{es:"F2 — Valoración",en:"F2 — Valuation"},
        f3:{es:"F3 — Ciclo Sectorial",en:"F3 — Sector Cycle"},f4:{es:"F4 — Gestión Capital",en:"F4 — Capital Mgmt"},
        f5:{es:"F5 — Competencia",en:"F5 — Competition"},f6:{es:"F6 — Macro",en:"F6 — Macro"},
        f7:{es:"F7 — Catalizadores",en:"F7 — Catalysts"},f8:{es:"F8 — ESG Real",en:"F8 — Real ESG"},
      }
    },
  ]
};

const C = {
  navy:"#0d1f3c",navy2:"#152d54",gold:"#c9a84c",cream:"#f5f0e8",cream2:"#ede8dc",
  gray:"#1a1a2e",muted:"#6b7280",green:"#1a6b3c",greenBg:"#e8f5ee",
  yellowBg:"#fef9e7",orangeBg:"#fef3e2",red:"#8b1a1a",redBg:"#fde8e8",
  verifiedBg:"#e8f5ee",verifiedText:"#1a6b3c",estimatedBg:"#fef9e7",estimatedText:"#7a5f00",
};

const VL={GO:{es:"✅ GO SIN DUDAS",en:"✅ GO — NO DOUBTS"},GO_COND:{es:"✅ GO CON CONDICIONES",en:"✅ GO WITH CONDITIONS"},WATCH:{es:"⏳ WATCHLIST",en:"⏳ WATCHLIST"},NOGO:{es:"❌ NO GO",en:"❌ NO GO"}};
const VC={GO:{bg:C.greenBg,border:C.green,text:C.green},GO_COND:{bg:C.yellowBg,border:C.gold,text:"#7a5f00"},WATCH:{bg:C.orangeBg,border:"#e08030",text:"#8a4000"},NOGO:{bg:C.redBg,border:C.red,text:C.red}};
const STEPS={
  es:["Obteniendo datos Finnhub en tiempo real...","Verificando métricas financieras...","Analizando balance y deuda...","Investigando CEO y accionariado...","Analizando ciclo y macro...","Detectando polémicas y ESG...","Aplicando 8 filtros...","Calculando score ponderado...","Generando veredicto GO / NO GO..."],
  en:["Fetching real-time Finnhub data...","Verifying financial metrics...","Analyzing balance and debt...","Researching CEO and shareholders...","Analyzing cycle and macro...","Detecting controversies and ESG...","Applying 8 filters...","Calculating weighted score...","Generating GO / NO GO verdict..."]
};

const US_EXCHANGES=["NYSE","NASDAQ"];

function maxScore(w){return Object.values(w).reduce((a,v)=>a+5*v,0);}
function fmtB(v){if(!v)return null;const abs=Math.abs(v);if(abs>=1e12)return `$${(v/1e12).toFixed(2)}T`;if(abs>=1e9)return `$${(v/1e9).toFixed(2)}B`;if(abs>=1e6)return `$${(v/1e6).toFixed(2)}M`;return `$${v}`;}

// Strip citation tags from Claude responses
function stripCites(text){
  if(!text) return "";
  return text.replace(/<cite[^>]*>([^<]*)<\/cite>/gi,"$1").replace(/<\/?cite[^>]*>/gi,"").trim();
}

// Sanity checks on metrics
function sanityCheck(metrics, sector){
  const warnings = [];
  const per = parseFloat(metrics?.per);
  const evEbitda = parseFloat(metrics?.evEbitda);
  const netDebt = parseFloat(metrics?.netDebtEbitda);
  const roe = parseFloat(metrics?.roe);
  if(!isNaN(per) && per < 0) warnings.push("⚠️ PER negativo — empresa con pérdidas");
  if(!isNaN(per) && per > 100) warnings.push("⚠️ PER >100 — valoración muy elevada, verifica");
  if(!isNaN(evEbitda) && evEbitda > 50) warnings.push("⚠️ EV/EBITDA >50 — posible sobrevaloración");
  if(!isNaN(netDebt) && netDebt > 10) warnings.push("⚠️ Deuda/EBITDA >10 — riesgo alto de insolvencia");
  if(!isNaN(roe) && roe > 50 && sector !== "financial") warnings.push("⚠️ ROE >50% — verifica si es correcto");
  return warnings;
}

// Check analysis age
function analysisAge(dateStr){
  try {
    const parts = dateStr.split(" ");
    const months = {ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
    const d = new Date(parts[2], months[parts[1]?.toLowerCase()] ?? 0, parseInt(parts[0]));
    const days = Math.round((Date.now() - d.getTime()) / (1000*3600*24));
    return days;
  } catch { return 0; }
}

// Export CSV
function exportCSV(a, lang){
  const t=(es,en)=>lang==="es"?es:en;
  const rows = [
    ["Campo","Valor","Fuente","Fecha"],
    ["Ticker", a.ticker, "input", a.date],
    ["Empresa", a.name, a.confidence?.name||"IA", a.date],
    ["Bolsa", a.exchange, "input", a.date],
    ["Sector", a.sector, a.confidence?.sector||"IA", a.date],
    ["Precio", a.price, a.confidence?.price||"est", a.date],
    ["Market Cap", a.marketCap, a.confidence?.marketCap||"est", a.date],
    ["PER", a.metrics?.per, a.confidence?.per||"est", a.date],
    ["EV/EBITDA", a.metrics?.evEbitda, a.confidence?.evEbitda||"est", a.date],
    ["Net Deuda/EBITDA", a.metrics?.netDebtEbitda, a.confidence?.netDebtEbitda||"est", a.date],
    ["ROE", a.metrics?.roe, a.confidence?.roe||"est", a.date],
    ["Beta", a.metrics?.beta, a.confidence?.beta||"est", a.date],
    ["Dividendo", a.metrics?.dividendYield, a.confidence?.dividendYield||"est", a.date],
    ["Score", `${a.totalScore}/${a.maxScore}`, "VDP", a.date],
    ["Veredicto", a.verdict, "VDP", a.date],
    ...["f1","f2","f3","f4","f5","f6","f7","f8"].map(k=>[
      a.sectorConfig?.filterNames?.[k]?.[lang==="es"?"es":"en"]||k,
      `${a.filters?.[k]?.score||0}/5`,
      "IA", a.date
    ]),
    [t("Tesis","Thesis"), (a[lang==="es"?"investmentThesis_es":"investmentThesis_en"]||"").replace(/\n/g," "), "IA", a.date],
    [t("Condiciones","Conditions"), (a[lang==="es"?"conditions_es":"conditions_en"]||"").replace(/\n/g," "), "IA", a.date],
  ];
  const csv = rows.map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a2 = document.createElement("a");
  a2.href = url; a2.download = `VDP_${a.ticker}_${a.date}.csv`;
  a2.click(); URL.revokeObjectURL(url);
}

async function fetchFinnhub(tk, exchange){
  const isUS = US_EXCHANGES.includes(exchange);
  if(!isUS) return {verified:{},src:{},resolvedSymbol:tk,isUS:false};
  try{
    const r = await fetch(`${PROXY}/api/quote?symbol=${tk}`);
    if(!r.ok) return {verified:{},src:{},resolvedSymbol:tk,isUS:true};
    const d = await r.json();
    const quote=d.quote||{}, profile=d.profile||{}, m=(d.metrics?.metric)||{};
    const verified={}, src={};
    if(quote.c){verified.price=`$${Number(quote.c).toFixed(2)}`;src.price="Finnhub";}
    if(quote.d!=null){verified.priceChange=`${quote.d>=0?"+":""}${Number(quote.d).toFixed(2)} (${Number(quote.dp).toFixed(2)}%)`;src.priceChange="Finnhub";}
    if(profile.marketCapitalization){verified.marketCap=fmtB(profile.marketCapitalization*1e6);src.marketCap="Finnhub";}
    if(profile.name){verified.name=profile.name;src.name="Finnhub";}
    if(profile.finnhubIndustry){verified.sector=profile.finnhubIndustry;src.sector="Finnhub";}
    if(m.peTTM){verified.per=Number(m.peTTM).toFixed(1);src.per="Finnhub";}
    if(m.evEbitdaTTM){verified.evEbitda=Number(m.evEbitdaTTM).toFixed(1);src.evEbitda="Finnhub";}
    if(m.roeTTM){verified.roe=`${Number(m.roeTTM).toFixed(1)}%`;src.roe="Finnhub";}
    if(m.netDebtToEquityAnnual!=null){verified.netDebtEbitda=Number(m.netDebtToEquityAnnual).toFixed(2);src.netDebtEbitda="Finnhub";}
    if(m.beta){verified.beta=Number(m.beta).toFixed(2);src.beta="Finnhub";}
    if(m.dividendYieldIndicatedAnnual){verified.dividendYield=`${Number(m.dividendYieldIndicatedAnnual).toFixed(2)}%`;src.dividendYield="Finnhub";}
    if(m["52WeekHigh"]){verified.high52=`$${Number(m["52WeekHigh"]).toFixed(2)}`;src.high52="Finnhub";}
    if(m["52WeekLow"]){verified.low52=`$${Number(m["52WeekLow"]).toFixed(2)}`;src.low52="Finnhub";}
    return {verified,src,resolvedSymbol:tk,isUS:true};
  }catch{
    return {verified:{},src:{},resolvedSymbol:tk,isUS:true};
  }
}

function buildPrompt(sec,fhData){
  const fk=["f1","f2","f3","f4","f5","f6","f7","f8"];
  const ws=fk.map(k=>`${k.toUpperCase()}:x${sec.weights[k]||1}`).join(" ");
  const ms=maxScore(sec.weights).toFixed(1);
  const names=fk.map(k=>`${k}=${sec.filterNames[k]?.en||k}`).join(" ");
  const th={go:80,goCond:64,watch:49};
  const vBlock=Object.keys(fhData.verified).length>0
    ?`\n\nVERIFIED_DATA_FROM_FINNHUB (use these exact values, do NOT add citation tags):\n${JSON.stringify(fhData.verified,null,2)}`:"";
  return `You are Vendedor de Palas analyzer — ${sec.expertise.en}
SECTOR:${sec.names.en} WEIGHTS:${ws} MAX:${ms}pts DISQUALIFIER:${sec.disqualifier.toUpperCase()}=1→NOGO
THRESHOLDS: GO>=${th.go}% GO_COND>=${th.goCond}% WATCH>=${th.watch}%
FILTERS: ${names}${vBlock}
CRITICAL: Do NOT include any XML tags, citation tags, or markdown in string fields. Plain text only.
chainLevel must be ONE of: OEM/Tier1/Tier2/Upstream/Midstream/Downstream/Aftermarket/Distributor/Platform/Diversified
Use web_search for qualitative data. Return ONLY valid JSON no markdown:
{"name":"","sector":"","price":"","marketCap":"","metrics":{"per":"","evEbitda":"","netDebtEbitda":"","roe":"","beta":"","dividendYield":""},"confidence":{"price":"verified","marketCap":"verified","per":"verified","evEbitda":"verified","netDebtEbitda":"verified","roe":"verified"},"layer1":{"feverValid":true,"chainLevel":"OEM","summary_es":"","summary_en":""},"layer2":{"ceo":{"name":"","tenure":"","skinInGame":"","signal":"green","summary_es":"","summary_en":""},"shareholders":{"topHolder":"","type":"fund","signal":"green","summary_es":"","summary_en":""},"controversies":{"active":false,"severity":"none","signal":"green","summary_es":"","summary_en":""}},"filters":{"f1":{"score":4,"pts":8,"summary_es":"","summary_en":""},"f2":{"score":4,"pts":6,"summary_es":"","summary_en":""},"f3":{"score":4,"pts":6,"summary_es":"","summary_en":""},"f4":{"score":4,"pts":6,"summary_es":"","summary_en":""},"f5":{"score":4,"pts":4,"summary_es":"","summary_en":""},"f6":{"score":4,"pts":4,"summary_es":"","summary_en":""},"f7":{"score":4,"pts":4,"summary_es":"","summary_en":""},"f8":{"score":4,"pts":4,"summary_es":"","summary_en":""}},"totalScore":42,"maxScore":${ms},"verdict":"GO","f1Override":false,"investmentThesis_es":"","investmentThesis_en":"","conditions_es":"","conditions_en":""}`;
}

function Stars({n}){return <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:11,height:11,borderRadius:"50%",background:i<=n?C.gold:C.cream2}}/>)}</div>;}
function Sig({s}){return <span style={{fontSize:"1.1rem"}}>{{green:"🟢",yellow:"🟡",red:"🔴"}[s]||"⚪"}</span>;}
function Bdg({v}){
  const m={GO:{bg:C.greenBg,c:C.green,l:"GO ✓"},GO_COND:{bg:C.yellowBg,c:"#7a5f00",l:"GO*"},WATCH:{bg:C.orangeBg,c:"#8a4000",l:"WATCH"},NOGO:{bg:C.redBg,c:C.red,l:"NO GO"}};
  const d=m[v]||m.WATCH;
  return <span style={{fontFamily:"monospace",fontSize:"0.55rem",fontWeight:700,padding:"3px 7px",borderRadius:2,background:d.bg,color:d.c,whiteSpace:"nowrap"}}>{d.l}</span>;
}
function ConfBadge({c}){
  if(!c)return null;
  const verified=c==="verified"||c==="Finnhub";
  return <span style={{fontFamily:"monospace",fontSize:"0.42rem",fontWeight:700,padding:"2px 5px",borderRadius:8,background:verified?C.verifiedBg:C.estimatedBg,color:verified?C.verifiedText:C.estimatedText,border:`1px solid ${verified?"rgba(26,107,60,0.3)":"rgba(201,168,76,0.4)"}`,whiteSpace:"nowrap"}}>{verified?"✓ FH":"~ est"}</span>;
}

function MetricCard({label,value,sub,conf,subConf}){
  return(
    <div style={{background:"white",padding:"0.85rem",textAlign:"center"}}>
      <span style={{fontFamily:"monospace",fontSize:"0.48rem",fontWeight:700,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:3}}>{label}</span>
      <div style={{fontFamily:"Georgia,serif",fontSize:"1.1rem",fontWeight:700,color:C.navy,lineHeight:1.2}}>{value||"N/A"}</div>
      {conf&&<div style={{marginTop:3}}><ConfBadge c={conf}/></div>}
      <span style={{fontFamily:"monospace",fontSize:"0.48rem",color:C.muted,display:"block",marginTop:3}}>{sub||""}</span>
      {subConf&&<ConfBadge c={subConf}/>}
    </div>
  );
}

function Results({a,lang,onReanalyze,onExport}){
  const t=(es,en)=>lang==="es"?es:en;
  const sec=CFG.sectors.find(s=>s.key===a.sectorKey)||CFG.sectors[CFG.sectors.length-1];
  const saved=a.sectorConfig||{weights:sec.weights,filterNames:sec.filterNames,disqualifier:sec.disqualifier};
  const vc=VC[a.verdict]||VC.WATCH;
  const pct=Math.round((a.totalScore/a.maxScore)*100);
  const bc={GO:C.green,GO_COND:C.gold,WATCH:"#e08030",NOGO:C.red}[a.verdict];
  const fn=k=>saved.filterNames?.[k]?.[lang==="es"?"es":"en"]||k;
  const fw=k=>saved.weights?.[k]||1;
  const isDisq=k=>k===saved.disqualifier&&(a.filters?.[k]?.score||0)===1;
  const conf=a.confidence||{};
  const cd={background:"white",border:`1px solid ${C.cream2}`,borderRadius:6,padding:"1rem",boxShadow:"0 1px 6px rgba(13,31,60,0.06)"};
  const verifiedCount=Object.values(conf).filter(v=>v==="verified"||v==="Finnhub").length;
  const totalConf=Object.keys(conf).length;
  const days=analysisAge(a.date);
  const warnings=sanityCheck(a.metrics, a.sectorKey);

  return(
    <div style={{padding:"1.5rem"}}>
      {/* Age warning */}
      {days>30&&(
        <div style={{background:C.yellowBg,border:`1px solid ${C.gold}`,borderRadius:6,padding:"10px 14px",marginBottom:"1rem",fontFamily:"monospace",fontSize:"0.58rem",color:"#7a5f00",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>⚠️ {t(`Análisis de hace ${days} días — datos pueden haber cambiado`,`Analysis ${days} days old — data may have changed`)}</span>
          <button onClick={onReanalyze} style={{fontFamily:"monospace",fontSize:"0.55rem",fontWeight:700,padding:"4px 10px",background:C.gold,color:C.navy,border:"none",borderRadius:4,cursor:"pointer"}}>{t("Re-analizar","Re-analyze")}</button>
        </div>
      )}

      {/* Sanity warnings */}
      {warnings.length>0&&(
        <div style={{background:C.redBg,border:`1px solid ${C.red}`,borderRadius:6,padding:"10px 14px",marginBottom:"1rem"}}>
          {warnings.map((w,i)=><div key={i} style={{fontFamily:"monospace",fontSize:"0.58rem",color:C.red}}>{w}</div>)}
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.25rem",paddingBottom:"1.25rem",borderBottom:`2px solid rgba(201,168,76,0.2)`,flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
            <span>{sec.icon}</span>
            <span style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:700,textTransform:"uppercase",color:C.muted,background:C.cream2,padding:"3px 8px",borderRadius:10}}>{t(sec.names.es,sec.names.en)}</span>
            {totalConf>0&&<span style={{fontFamily:"monospace",fontSize:"0.48rem",padding:"3px 8px",borderRadius:10,background:verifiedCount>=4?C.verifiedBg:C.estimatedBg,color:verifiedCount>=4?C.verifiedText:C.estimatedText,border:`1px solid ${verifiedCount>=4?"rgba(26,107,60,0.3)":"rgba(201,168,76,0.3)"}`}}>{verifiedCount}/{totalConf} ✓ Finnhub</span>}
            {days>0&&days<=30&&<span style={{fontFamily:"monospace",fontSize:"0.45rem",color:C.muted,background:C.cream2,padding:"2px 6px",borderRadius:8}}>{days}d</span>}
          </div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.7rem",fontWeight:900,color:C.navy,lineHeight:1.1,margin:0}}>{a.name||a.ticker}</h2>
          <span style={{fontFamily:"monospace",fontSize:"0.62rem",fontWeight:600,color:C.gold,letterSpacing:"0.12em",display:"block",marginTop:3}}>{a.ticker} · {a.exchange}</span>
          <span style={{fontFamily:"monospace",fontSize:"0.52rem",color:C.muted}}>{a.sector}</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
          <div style={{textAlign:"center",padding:"14px 20px",borderRadius:6,background:vc.bg,border:`2px solid ${vc.border}`,minWidth:155}}>
            <div style={{fontFamily:"Georgia,serif",fontSize:"2rem",fontWeight:900,color:vc.text,lineHeight:1}}>{a.totalScore}<span style={{fontSize:"0.9rem",opacity:0.7}}>/{a.maxScore}</span></div>
            <span style={{fontFamily:"monospace",fontSize:"0.6rem",fontWeight:700,color:vc.text,display:"block",marginTop:5}}>{VL[a.verdict]?.[lang]}</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={onReanalyze} style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:600,padding:"5px 10px",background:"transparent",color:C.navy,border:`1px solid ${C.cream2}`,borderRadius:4,cursor:"pointer"}}>🔄 {t("Re-analizar","Re-analyze")}</button>
            <button onClick={onExport} style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:600,padding:"5px 10px",background:"transparent",color:C.green,border:`1px solid ${C.green}`,borderRadius:4,cursor:"pointer"}}>📥 CSV</button>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{...cd,marginBottom:"1.25rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontFamily:"monospace",fontSize:"0.58rem",fontWeight:600,color:C.navy}}>{t("Score ponderado","Weighted score")}: {a.totalScore} / {a.maxScore}</span>
          <span style={{fontFamily:"monospace",fontSize:"0.58rem",color:C.muted}}>{pct}%</span>
        </div>
        <div style={{height:10,background:C.cream2,borderRadius:5,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${pct}%`,background:bc,borderRadius:5}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          {["NO GO","WATCH","GO*","GO","MAX"].map((l,i)=>(
            <span key={i} style={{fontFamily:"monospace",fontSize:"0.48rem",color:C.muted,textAlign:"center"}}>{[0,CFG.thresholds.watch,CFG.thresholds.goCond,CFG.thresholds.go,100][i]}%<br/>{l}</span>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.cream2,borderRadius:6,overflow:"hidden",marginBottom:"1.25rem"}}>
        <MetricCard label={t("Precio","Price")} value={a.price} conf={conf.price} sub={`Cap: ${a.marketCap||"N/A"}`} subConf={conf.marketCap}/>
        <MetricCard label="PER" value={a.metrics?.per} conf={conf.per} sub={`EV/EBITDA: ${a.metrics?.evEbitda||"N/A"}`} subConf={conf.evEbitda}/>
        <MetricCard label="Net D/EBITDA" value={a.metrics?.netDebtEbitda} conf={conf.netDebtEbitda} sub={`ROE: ${a.metrics?.roe||"N/A"}`} subConf={conf.roe}/>
        <MetricCard label={t("Cadena","Chain")} value={a.layer1?.chainLevel||"N/A"} sub={a.layer1?.feverValid?"✓ Fever OK":"⚠ Revisar"}/>
      </div>

      {(a.metrics?.beta||a.metrics?.dividendYield)&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:C.cream2,borderRadius:6,overflow:"hidden",marginBottom:"1.25rem"}}>
          <MetricCard label="Beta" value={a.metrics?.beta} conf={conf.beta}/>
          <MetricCard label={t("Dividendo","Dividend")} value={a.metrics?.dividendYield} conf={conf.dividendYield}/>
          <div style={{background:"white",gridColumn:"span 2",padding:"0.85rem",display:"flex",alignItems:"center"}}>
            <span style={{fontFamily:"monospace",fontSize:"0.52rem",color:C.muted,lineHeight:1.7}}>{lang==="es"?a.layer1?.summary_es:a.layer1?.summary_en}</span>
          </div>
        </div>
      )}

      {/* Layer 2 */}
      <div style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.navy,marginBottom:"0.75rem"}}>{t("Capa 2 — Psicología","Layer 2 — Psychology")}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem",marginBottom:"1.25rem"}}>
        {[
          {label:"CEO",sig:a.layer2?.ceo?.signal,main:stripCites(a.layer2?.ceo?.name),sub:`${a.layer2?.ceo?.tenure||""} · ${a.layer2?.ceo?.skinInGame||""}`,text:stripCites(a.layer2?.ceo?.[lang==="es"?"summary_es":"summary_en"])},
          {label:t("Accionariado","Shareholders"),sig:a.layer2?.shareholders?.signal,main:stripCites(a.layer2?.shareholders?.topHolder),sub:a.layer2?.shareholders?.type||"",text:stripCites(a.layer2?.shareholders?.[lang==="es"?"summary_es":"summary_en"])},
          {label:t("Polémicas","Controversies"),sig:a.layer2?.controversies?.signal,main:`${t("Severidad","Severity")}: ${a.layer2?.controversies?.severity||"N/A"}`,sub:a.layer2?.controversies?.active?"⚠ Activas":"✓ Ninguna",text:stripCites(a.layer2?.controversies?.[lang==="es"?"summary_es":"summary_en"])},
        ].map((c,i)=>(
          <div key={i} style={cd}>
            <div style={{fontFamily:"monospace",fontSize:"0.5rem",fontWeight:700,textTransform:"uppercase",color:C.muted,marginBottom:"0.5rem"}}>{c.label}</div>
            <Sig s={c.sig}/><div style={{fontWeight:600,fontSize:"0.82rem",margin:"4px 0"}}>{c.main||"N/A"}</div>
            <div style={{fontFamily:"monospace",fontSize:"0.5rem",color:C.muted,marginBottom:8}}>{c.sub}</div>
            <div style={{fontSize:"0.78rem",color:C.muted,lineHeight:1.6}}>{c.text||""}</div>
          </div>
        ))}
      </div>

      {/* 8 Filters */}
      <div style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.navy,marginBottom:"0.75rem"}}>{t("Capa 3 — 8 Filtros","Layer 3 — 8 Filters")}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"0.75rem",marginBottom:"1.25rem"}}>
        {["f1","f2","f3","f4","f5","f6","f7","f8"].map(k=>{
          const fd=a.filters?.[k]||{};
          const dq=isDisq(k);
          return(
            <div key={k} style={{...cd,border:`1px solid ${dq?C.red:C.cream2}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                <span style={{fontFamily:"monospace",fontSize:"0.5rem",fontWeight:700,textTransform:"uppercase",color:C.muted}}>{fn(k)}</span>
                <span style={{fontFamily:"monospace",fontSize:"0.5rem",color:C.gold,background:"rgba(201,168,76,0.1)",padding:"2px 6px",borderRadius:10}}>×{fw(k)}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.5rem"}}>
                <span style={{fontFamily:"Georgia,serif",fontSize:"1.5rem",fontWeight:900,color:C.navy,lineHeight:1}}>{fd.score||0}</span>
                <Stars n={fd.score||0}/>
                <span style={{fontFamily:"monospace",fontSize:"0.52rem",color:C.muted,marginLeft:"auto"}}>{fd.pts||0}/{(5*fw(k)).toFixed(1)}pts</span>
              </div>
              <div style={{fontSize:"0.78rem",color:C.muted,lineHeight:1.6,borderTop:`1px solid ${C.cream2}`,paddingTop:"0.5rem"}}>{stripCites(fd[lang==="es"?"summary_es":"summary_en"])||""}</div>
              {dq&&<div style={{marginTop:8,fontFamily:"monospace",fontSize:"0.58rem",fontWeight:600,color:C.red,padding:"5px 8px",background:C.redBg,borderRadius:4}}>⛔ {t("DESCARTANTE AUTOMÁTICO","AUTOMATIC DISQUALIFIER")}</div>}
            </div>
          );
        })}
      </div>

      {/* Investment thesis */}
      <div style={{...cd,marginBottom:"1rem"}}>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:"1rem",fontWeight:700,color:C.navy,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:`1px solid ${C.cream2}`}}>{t("Tesis de inversión","Investment thesis")}</h3>
        <div style={{fontSize:"0.88rem",lineHeight:1.9,color:C.gray,whiteSpace:"pre-wrap"}}>{stripCites(a[lang==="es"?"investmentThesis_es":"investmentThesis_en"])||""}</div>
      </div>

      {a.verdict==="GO_COND"&&(a.conditions_es||a.conditions_en)&&(
        <div style={{background:C.yellowBg,border:`1px solid ${C.gold}`,borderRadius:6,padding:"1.25rem",marginBottom:"1rem"}}>
          <h3 style={{fontFamily:"Georgia,serif",fontSize:"1rem",fontWeight:700,color:"#7a5f00",marginBottom:"0.75rem"}}>{t("Condiciones para posición completa","Conditions for full position")}</h3>
          <div style={{fontSize:"0.88rem",lineHeight:1.9,color:"#7a5f00",whiteSpace:"pre-wrap"}}>{stripCites(a[lang==="es"?"conditions_es":"conditions_en"])||""}</div>
        </div>
      )}

      <div style={{fontFamily:"monospace",fontSize:"0.52rem",color:C.muted,textAlign:"right",marginTop:"0.5rem"}}>
        {a.date} · Vendedor de Palas v2.3 · {t(sec.names.es,sec.names.en)} · Finnhub + Claude
      </div>
    </div>
  );
}

export default function App(){
  const [lang,setLang]=useState("es");
  const [ticker,setTicker]=useState("");
  const [exchange,setExchange]=useState("NYSE");
  const [sectorKey,setSectorKey]=useState("industrial");
  const [portfolio,setPortfolio]=useState([]);
  const [current,setCurrent]=useState(null);
  const [screen,setScreen]=useState("welcome");
  const [stepIdx,setStepIdx]=useState(-1);
  const [loading,setLoading]=useState(false);
  const [errorMsg,setErrorMsg]=useState("");
  const [toast,setToast]=useState("");
  const [finnhubStatus,setFinnhubStatus]=useState(null);
  const t=(es,en)=>lang==="es"?es:en;

  useEffect(()=>{
    const saved=localStorage.getItem("vdp_v3");
    if(saved){
      try{
        const d=JSON.parse(saved);
        setPortfolio(d);
        if(d.length>0){setCurrent(d[d.length-1]);setScreen("results");}
      }catch{}
    }
  },[]);

  const savePf=useCallback(u=>{
    setPortfolio(u);
    try{localStorage.setItem("vdp_v3",JSON.stringify(u));}catch{}
  },[]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const analyze=async(reanalyzeItem=null)=>{
    const tk=(reanalyzeItem?.ticker||ticker).trim().toUpperCase();
    const exch=reanalyzeItem?.exchange||exchange;
    const sk=reanalyzeItem?.sectorKey||sectorKey;
    if(!tk||loading)return;
    const sec=CFG.sectors.find(s=>s.key===sk)||CFG.sectors[CFG.sectors.length-1];
    setLoading(true);setScreen("loading");setStepIdx(0);setFinnhubStatus(null);
    const steps=STEPS[lang];
    let si=0;
    const timer=setInterval(()=>{si++;if(si<steps.length)setStepIdx(si);else clearInterval(timer);},1000);
    try{
      setStepIdx(0);
      const fhData=await fetchFinnhub(tk,exch);
      const hasVerified=Object.keys(fhData.verified).length>0;
      setFinnhubStatus(hasVerified?"ok":"fail");
      if(hasVerified) showToast(t(`✓ Finnhub: ${Object.keys(fhData.verified).length} métricas`,`✓ Finnhub: ${Object.keys(fhData.verified).length} metrics`));
      setStepIdx(1);

      const res=await fetch(`${PROXY}/api/analyze`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:8000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          system:buildPrompt(sec,fhData),
          messages:[{role:"user",content:`Analyze: ${tk} on ${exch}. Sector: ${sec.names.en}. ${hasVerified?"Finnhub verified data in system prompt.":"Search for real data."} Return JSON only. No XML tags in text fields.`}]
        })
      });
      clearInterval(timer);setStepIdx(steps.length);
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e?.error?.message||`API error ${res.status}`);}
      const data=await res.json();
      const tb=data.content?.find(b=>b.type==="text");
      if(!tb)throw new Error("No text response");
      let raw=tb.text.trim().replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/,"").trim();
      const jS=raw.indexOf("{"),jE=raw.lastIndexOf("}");
      if(jS!==-1&&jE!==-1)raw=raw.slice(jS,jE+1);
      const a=JSON.parse(raw);

      if(fhData.verified.price)a.price=fhData.verified.price;
      if(fhData.verified.marketCap)a.marketCap=fhData.verified.marketCap;
      if(fhData.verified.per&&a.metrics)a.metrics.per=fhData.verified.per;
      if(fhData.verified.evEbitda&&a.metrics)a.metrics.evEbitda=fhData.verified.evEbitda;
      if(fhData.verified.roe&&a.metrics)a.metrics.roe=fhData.verified.roe;
      if(fhData.verified.netDebtEbitda&&a.metrics)a.metrics.netDebtEbitda=fhData.verified.netDebtEbitda;
      if(fhData.verified.beta&&a.metrics)a.metrics.beta=fhData.verified.beta;
      if(fhData.verified.dividendYield&&a.metrics)a.metrics.dividendYield=fhData.verified.dividendYield;
      if(fhData.verified.name)a.name=fhData.verified.name;

      a.confidence=a.confidence||{};
      Object.keys(fhData.src).forEach(k=>{a.confidence[k]=fhData.src[k];});
      a.ticker=tk;a.exchange=exch;a.sectorKey=sk;
      a.sectorConfig={weights:sec.weights,filterNames:sec.filterNames,disqualifier:sec.disqualifier};
      a.fhVerified=fhData.verified;
      a.date=new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"});

      // If reanalyzing, replace old entry; otherwise append
      let u;
      if(reanalyzeItem){
        u=portfolio.map(p=>p.ticker===reanalyzeItem.ticker&&p.date===reanalyzeItem.date?a:p);
      } else {
        u=[...portfolio,a];
      }
      savePf(u);setCurrent(a);setScreen("results");setTicker("");
      showToast(t(`✓ ${tk} analizado`,`✓ ${tk} analyzed`));
    }catch(err){
      clearInterval(timer);setErrorMsg(err.message);setScreen("error");
    }
    setLoading(false);
  };

  const removeItem=idx=>{
    const u=portfolio.filter((_,i)=>i!==idx);
    savePf(u);
    if(current&&portfolio[idx]?.ticker===current.ticker&&portfolio[idx]?.date===current.date){
      u.length>0?setCurrent(u[u.length-1]):(setCurrent(null),setScreen("welcome"));
    }
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"Georgia,serif",background:C.cream,color:C.gray,overflow:"hidden"}}>
      {toast&&<div style={{position:"fixed",top:62,right:16,background:C.navy,color:C.cream,fontFamily:"monospace",fontSize:"0.7rem",padding:"9px 16px",borderRadius:4,border:`1px solid ${C.gold}`,zIndex:300,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>{toast}</div>}
      <header style={{background:C.navy,borderBottom:`3px solid ${C.gold}`,padding:"0 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,background:C.gold,clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⛏</div>
          <div>
            <span style={{fontFamily:"Georgia,serif",fontSize:"0.95rem",fontWeight:700,color:C.cream}}>Vendedor de Palas</span>
            <span style={{fontFamily:"monospace",fontSize:"0.48rem",color:C.gold,letterSpacing:"0.15em",display:"block",lineHeight:1}}>INVESTMENT METHOD v2.3 · Finnhub + Claude</span>
          </div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {finnhubStatus&&<span style={{fontFamily:"monospace",fontSize:"0.5rem",padding:"3px 8px",borderRadius:10,background:finnhubStatus==="ok"?C.verifiedBg:C.redBg,color:finnhubStatus==="ok"?C.verifiedText:C.red}}>{finnhubStatus==="ok"?"● Finnhub live":"● Finnhub fail"}</span>}
          {["es","en"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{fontFamily:"monospace",fontSize:"0.6rem",fontWeight:700,padding:"4px 10px",border:`1px solid ${lang===l?C.gold:"rgba(201,168,76,0.3)"}`,background:lang===l?C.gold:"transparent",color:lang===l?C.navy:C.muted,cursor:"pointer",borderRadius:2}}>{l.toUpperCase()}</button>
          ))}
        </div>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <aside style={{width:280,background:C.navy2,borderRight:`1px solid rgba(201,168,76,0.2)`,display:"flex",flexDirection:"column",padding:"1.25rem",gap:"1rem",overflow:"hidden",flexShrink:0}}>
          <div>
            <span style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,marginBottom:"0.6rem",display:"block"}}>{t("Nueva empresa","New company")}</span>
            <input value={ticker} onChange={e=>setTicker(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyze()}
              placeholder="CAT, NVDA, MSFT..." maxLength={10}
              style={{fontFamily:"monospace",fontSize:"1.2rem",fontWeight:700,background:"rgba(255,255,255,0.06)",border:`1px solid rgba(201,168,76,0.3)`,color:C.cream,padding:"9px 12px",width:"100%",letterSpacing:"0.1em",textTransform:"uppercase",outline:"none",borderRadius:4,marginBottom:6,boxSizing:"border-box"}}/>
            <select value={exchange} onChange={e=>setExchange(e.target.value)}
              style={{fontFamily:"monospace",fontSize:"0.6rem",background:"rgba(255,255,255,0.06)",border:`1px solid rgba(201,168,76,0.3)`,color:C.cream,padding:"6px 10px",width:"100%",outline:"none",borderRadius:4,marginBottom:6}}>
              {CFG.exchanges.map(ex=><option key={ex.code} value={ex.code} style={{background:C.navy}}>{ex.label}</option>)}
            </select>
            <select value={sectorKey} onChange={e=>setSectorKey(e.target.value)}
              style={{fontFamily:"monospace",fontSize:"0.6rem",background:"rgba(255,255,255,0.06)",border:`1px solid rgba(201,168,76,0.3)`,color:C.gold,padding:"6px 10px",width:"100%",outline:"none",borderRadius:4,marginBottom:8}}>
              {CFG.sectors.filter(s=>s.active).map(s=><option key={s.key} value={s.key} style={{background:C.navy,color:"white"}}>{s.icon} {lang==="es"?s.names.es:s.names.en}</option>)}
            </select>
            <div style={{fontFamily:"monospace",fontSize:"0.5rem",color:"rgba(201,168,76,0.6)",marginBottom:8,padding:"5px 8px",background:"rgba(201,168,76,0.05)",borderRadius:4,borderLeft:`2px solid rgba(201,168,76,0.3)`}}>
              {t("Descartante","Disqualifier")}: {(CFG.sectors.find(s=>s.key===sectorKey)||CFG.sectors[0]).disqualifier.toUpperCase()} · Max: {maxScore((CFG.sectors.find(s=>s.key===sectorKey)||CFG.sectors[0]).weights).toFixed(1)}pts
            </div>
            <button onClick={()=>analyze()} disabled={loading}
              style={{fontFamily:"Georgia,serif",fontSize:"0.88rem",fontWeight:700,background:loading?"rgba(201,168,76,0.5)":C.gold,color:C.navy,border:"none",padding:"11px",width:"100%",cursor:loading?"not-allowed":"pointer",borderRadius:4}}>
              {loading?t("⏳ Analizando...","⏳ Analyzing..."):t("⛏ Analizar empresa","⛏ Analyze company")}
            </button>
          </div>
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <span style={{fontFamily:"monospace",fontSize:"0.52rem",fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,marginBottom:"0.6rem",display:"block"}}>{t("Historial","History")} ({portfolio.length})</span>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
              {portfolio.length===0
                ?<div style={{color:"rgba(245,240,232,0.3)",fontSize:"0.75rem",fontStyle:"italic",textAlign:"center",padding:"1.5rem 0.5rem",lineHeight:1.8}}>{t("Introduce un ticker para comenzar","Enter a ticker to start")}</div>
                :[...portfolio].reverse().map((item,ri)=>{
                  const ri2=portfolio.length-1-ri;
                  const isAct=current?.ticker===item.ticker&&current?.date===item.date;
                  const s=CFG.sectors.find(s=>s.key===item.sectorKey)||CFG.sectors[CFG.sectors.length-1];
                  const days=analysisAge(item.date);
                  return(
                    <div key={ri2} onClick={()=>{setCurrent(item);setScreen("results");}}
                      style={{background:isAct?"rgba(201,168,76,0.14)":"rgba(255,255,255,0.04)",border:`1px solid ${isAct?C.gold:days>30?"rgba(201,168,76,0.5)":"rgba(201,168,76,0.2)"}`,borderRadius:4,padding:"8px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:"0.85rem"}}>{s?.icon||"🌐"}</span>
                      <div style={{fontFamily:"monospace",fontSize:"0.72rem",fontWeight:700,color:C.gold,minWidth:46}}>{item.ticker}</div>
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{fontSize:"0.68rem",color:C.cream,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name||item.ticker}</div>
                        <div style={{fontFamily:"monospace",fontSize:"0.44rem",color:days>30?"#e08030":C.muted}}>{item.exchange} · {item.date}{days>30?` · ⚠️${days}d`:""}</div>
                      </div>
                      <Bdg v={item.verdict}/>
                      <button onClick={e=>{e.stopPropagation();removeItem(ri2);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:"0.85rem",padding:"0 2px"}}>×</button>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </aside>

        <main style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {screen==="welcome"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem 2rem",textAlign:"center",gap:"1.5rem"}}>
              <div style={{width:68,height:68,background:C.navy,clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.7rem"}}>⛏</div>
              <h1 style={{fontFamily:"Georgia,serif",fontSize:"1.9rem",fontWeight:900,color:C.navy,margin:0}}>{t("El método de las palas","The Shovel Method")}</h1>
              <p style={{color:C.muted,fontSize:"0.95rem",maxWidth:440,lineHeight:1.9,margin:0}}>
                {t("Datos financieros reales vía Finnhub + análisis GO/NO GO con Claude.","Real financial data via Finnhub + GO/NO GO analysis with Claude.")}
              </p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                {[t("✓ Precio en tiempo real","✓ Real-time price"),t("✓ Métricas verificadas","✓ Verified metrics"),t("✓ Sanity checks automáticos","✓ Auto sanity checks"),t("✓ Export CSV","✓ CSV Export"),t("✓ Re-análisis con 1 click","✓ 1-click re-analyze")].map((f,i)=>(
                  <span key={i} style={{fontFamily:"monospace",fontSize:"0.52rem",color:C.verifiedText,background:C.verifiedBg,border:"1px solid rgba(26,107,60,0.2)",borderRadius:10,padding:"4px 10px"}}>{f}</span>
                ))}
              </div>
            </div>
          )}
          {screen==="loading"&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"3rem 2rem",gap:"1.5rem"}}>
              <div style={{width:48,height:48,border:`3px solid rgba(201,168,76,0.2)`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:"1.2rem",fontWeight:700,color:C.navy,marginBottom:4}}>{t(`Analizando...`,`Analyzing...`)}</div>
                {finnhubStatus==="ok"&&<div style={{fontFamily:"monospace",fontSize:"0.55rem",color:C.verifiedText,marginTop:6,background:C.verifiedBg,padding:"3px 10px",borderRadius:10,display:"inline-block"}}>✓ Finnhub data loaded</div>}
                {finnhubStatus==="fail"&&<div style={{fontFamily:"monospace",fontSize:"0.55rem",color:"#7a5f00",marginTop:6,background:C.yellowBg,padding:"3px 10px",borderRadius:10,display:"inline-block"}}>⚠ Sin datos Finnhub — usando web search</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5,width:"100%",maxWidth:380}}>
                {STEPS[lang].map((step,i)=>(
                  <div key={i} style={{fontFamily:"monospace",fontSize:"0.6rem",padding:"6px 11px",borderRadius:4,background:"white",borderLeft:`3px solid ${i<stepIdx?C.green:i===stepIdx?C.gold:"rgba(201,168,76,0.2)"}`,color:i<stepIdx?C.green:i===stepIdx?C.gray:C.muted,transition:"all 0.3s"}}>
                    {i<stepIdx?"✓ ":i===stepIdx?"→ ":""}{step}
                  </div>
                ))}
              </div>
            </div>
          )}
          {screen==="error"&&(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
              <div style={{background:C.redBg,border:`1px solid ${C.red}`,borderRadius:6,padding:"2rem",maxWidth:460,textAlign:"center"}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:"1.2rem",fontWeight:700,color:C.red,marginBottom:"0.5rem"}}>{t("Error en el análisis","Analysis error")}</div>
                <p style={{fontSize:"0.85rem",color:C.muted,marginBottom:"0.75rem",fontFamily:"monospace"}}>{errorMsg}</p>
                <button onClick={()=>setScreen(portfolio.length>0?"results":"welcome")} style={{fontFamily:"monospace",fontSize:"0.6rem",fontWeight:600,padding:"8px 18px",border:`1px solid ${C.red}`,background:"transparent",color:C.red,cursor:"pointer",borderRadius:4}}>{t("← Volver","← Back")}</button>
              </div>
            </div>
          )}
          {screen==="results"&&current&&(
            <Results
              a={current}
              lang={lang}
              onReanalyze={()=>analyze(current)}
              onExport={()=>exportCSV(current,lang)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
