By default, we use cross sections downloaded from "HITRAN on the Web"
http://hitran.iao.ru/molecule/simlaunch?mol=1
HITRAN is the gold standard for absorption cross sections, so it is the first place we look. 
Assuming HITRAN is missing cross sections for portions of the spectrum,
We download charts from http://satellite.mpic.de/spectral_atlas/ and digitize them manually. 
We then use R to manually digitize these datasets,
  compile them into charts along with HITRAN data,
  and find approximations for them using lerp() and sin(). 
Our work for this is shown in digitize.charts.R