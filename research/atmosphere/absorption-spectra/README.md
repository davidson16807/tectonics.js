By default, we use cross sections downloaded from "HITRAN on the Web"
http://hitran.iao.ru/molecule/simlaunch?mol=1
HITRAN is the gold standard for absorption cross sections, so it is the first place we look. 
Assuming HITRAN is missing cross sections for portions of the spectrum,
We download charts from http://satellite.mpic.de/spectral_atlas/ and digitize them manually. 
We then use R to manually digitize these datasets,
  compile them into charts along with HITRAN data,
  and find approximations for them using lerp() and sin(). 
Our work for this is shown in digitize.charts.R
The result of digitized.charts.R is stored in an R list containing the digitized dataframes,
 which is is then archived in a large (300MB) .Rdata file.
Since this file is so large, we store it outside the repository on google drive:
 https://drive.google.com/open?id=10DQA-DMgSjMOudn7pPCtBkXpNFAyDxVc
