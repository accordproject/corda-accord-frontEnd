/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Libraries */

function textLog(log, msg) {
  return { text: msg };
}
function parseSample(clause, text, log) {
  const changes = {};
  try {
    console.log('PARSING SAMPLE TEXT: ' + text);
    clause.parse(text);
    changes.jsonData = JSON.stringify(clause.getData(), null, 2);
    console.log('SUCCESS AND DATA IS : ' + changes.data);
    changes.log = textLog(log, 'Parse successful!');
    changes.contractText = text;
  } catch (error) {
    console.log('FAILURE!' + error.message);
    changes.jsonData = 'null';
    changes.log = textLog(log, `[Parse Contract] ${error.message}`);
    changes.contractText = text;
  }
  return changes;
}

function updateSample(clause, sample) {
  const template = clause.getTemplate();
  const samples = template.getMetadata().getSamples();
  if (samples.default !== sample) {
    samples.default = sample;
    template.setSamples(samples);
    return true;
  }
  return false;
}

export {
  parseSample,
  updateSample,
};
