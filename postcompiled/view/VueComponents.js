'use strict';
var vueComponents = {};
vueComponents.chart = `
<div id="chart" v-if="isEnabled">
 <table class="stat">
  <tr>
   <td class="name">min</td>
   <td class="value">{{round(min)}}</td>
  </tr>
  <tr>
   <td class="name">max</td>
   <td class="value">{{round(max)}}</td>
  </tr>
 </table>
 <table class="stat">
  <tr>
   <td class="name">mean</td>
   <td class="value">{{round(mean)}}</td>
  </tr>
  <tr>
   <td class="name">median</td>
   <td class="value">{{round(median)}}</td>
  </tr>
 </table>
 <table class="stat">
  <tr>
   <td class="name">S.D.</td>
   <td class="value">{{round(stddev)}}</td>
  </tr>
 </table>
 <chartjs-line :width="200" :height="100"
  :data="x"
  :labels="y"
  :bind="true"
  :pointbackgroundcolor="'rgba(255,255,255,0.2)'"
  :pointhoverbackgroundcolor="'rgba(255,255,255,0.2)'"
  :pointbordercolor="'rgba(255,255,255,0.2)'"
  :pointhoverbordercolor="'rgba(255,255,255,0.2)'"
  :bordercolor="'rgba(255,255,255,0.5)'"
  :backgroundcolor="'rgba(255,255,255,0.5)'"
  :fill="true"
  :option="options">
 </chartjs-line>
</div>
`;
