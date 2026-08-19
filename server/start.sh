#!/bin/bash

echo "Starting Roll Call System..."

# Server ပွင့်ဖို့ အချိန် ၂ စက္ကန့်လောက်စောင့်ပြီးရင် Browser ကို အလိုအလျောက် ဖွင့်ခိုင်းမယ်
# Ubuntu/Linux မှာ xdg-open ကို သုံးပြီး Default Browser ကို လှမ်းဖွင့်လို့ရပါတယ်
(sleep 2 && xdg-open http://localhost:5000) &

# Node.js Server ကို ဒီ Terminal မှာပဲ Run မယ်
# (Terminal ကို ပိတ်လိုက်တာနဲ့ Server ပါ အလိုအလျောက် ပိတ်သွားမှာမို့ အလွယ်ဆုံးပါပဲ)
node index.js