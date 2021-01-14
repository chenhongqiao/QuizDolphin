import JsPDF from 'jspdf';
import 'jspdf-autotable';

class PDFReport {
  static newReport(result) {
    const report = new JsPDF('l', 'mm', 'letter');
    const tableBody = [];
    for (let index = 0; index < result.questions.length; index += 1) {
      const row = [];
      if (result.results[index].points === result.results[index].score) {
        row[0] = {
          content: index + 1,
          styles: {
            fontStyle: 'bold',
            fillColor: [102, 187, 106],
          },
        };
      } else if (result.results[index].score === 0) {
        row[0] = {
          content: index + 1,
          styles: {
            fontStyle: 'bold',
            fillColor: [239, 83, 80],
          },
        };
      } else {
        row[0] = {
          content: index + 1,
          styles: {
            fontStyle: 'bold',
            fillColor: [253, 216, 53],
          },
        };
      }
      row[1] = result.questions[index].type;
      row[2] = {
        content: undefined,
        styles: {
          cellWidth: 80,
        },
      };
      if (result.questions[index].type === 'multiple choice'
      || result.questions[index].type === 'single choice'
      || result.questions[index].type === 'short response'
      ) {
        row[2].content = result.questions[index].context;
      } else if (result.questions[index].type === 'fill in the blanks') {
        row[2].content = '';
        for (let bIndex = 0; bIndex < result.questions[index].context.length; bIndex += 1) {
          row[2].content += result.questions[index].context[bIndex];
          if (result.questions[index].options[bIndex]) {
            row[2].content += ` ${bIndex + 1}.______`;
          }
        }
      } else if (result.questions[index].type === 'matching') {
        row[2].content = `${result.questions[index].context}\n\n`;
        for (let lIndex = 0; lIndex < result.questions[index].leftcol.length; lIndex += 1) {
          row[2].content += `${lIndex + 1}. ${result.questions[index].leftcol[lIndex]}\n\n`;
        }
      }

      if (result.questions[index].type === 'multiple choice'
      || result.questions[index].type === 'single choice'
      ) {
        row[3] = result.questions[index].options.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
      } else if (result.questions[index].type === 'short response') {
        row[3] = 'Not Available';
      } else if (result.questions[index].type === 'matching') {
        row[3] = result.questions[index].rightcol.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
      } else if (result.questions[index].type === 'fill in the blanks') {
        row[3] = '';
        for (let bIndex = 0; bIndex < result.questions[index].options.length; bIndex += 1) {
          row[3] += `${result.questions[index].options[bIndex].reduce((accumulator, current, aIndex) => {
            if (aIndex !== result.questions[index].options[bIndex].length - 1) {
              return `${accumulator}${current}, `;
            }
            return `${accumulator}${current}`;
          }, `${bIndex + 1}. `)}\n\n`;
        }
      }
      if (result.questions[index].type === 'single choice' || result.questions[index].type === 'short response') {
        row[4] = result.results[index].response;
        row[5] = result.results[index].answer;
      } else if (result.questions[index].type === 'multiple choice') {
        const response = (result.results[index].response).sort();
        row[4] = response.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
        const answer = (result.results[index].answer).sort();
        row[5] = answer.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
      } else if (result.questions[index].type === 'matching') {
        row[4] = '';
        for (let rIndex = 0; rIndex < result.results[index].answer.length; rIndex += 1) {
          row[4] += `${rIndex + 1}. ${result.results[index].response[rIndex] || ''}\n\n`;
        }
        row[5] = '';
        for (let rIndex = 0; rIndex < result.results[index].answer.length; rIndex += 1) {
          row[5] += `${rIndex + 1}. ${result.results[index].answer[rIndex] || ''}\n\n`;
        }
      } else if (result.questions[index].type === 'fill in the blanks') {
        row[4] = '';
        for (let bIndex = 0; bIndex < result.results[index].answer.length; bIndex += 1) {
          row[4] += `${bIndex + 1}. ${result.results[index].response[bIndex] || ''}\n\n`;
        }
        row[5] = '';
        for (let bIndex = 0; bIndex < result.results[index].answer.length; bIndex += 1) {
          row[5] += `${bIndex + 1}. ${result.results[index].answer[bIndex] || ''}\n\n`;
        }
      }
      row[6] = `${result.results[index].score}/${result.results[index].points}`;
      tableBody[index] = row;
    }
    report.autoTable({
      head: [['ID', 'Type', 'Context', 'Options', 'Response', 'Answer', 'Score']],
      body: tableBody,
    });
    report.save('test.pdf');
  }
}

export default PDFReport;
