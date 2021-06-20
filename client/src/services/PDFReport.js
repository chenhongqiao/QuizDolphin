import JsPDF from 'jspdf';
import 'jspdf-autotable';

class PDFReport {
  static newReport(result) {
    // Generates PDF Report
    const report = new JsPDF('l', 'mm', 'letter');
    const tableBody = [];
    for (let index = 0; index < result.length; index += 1) {
      const row = [];
      if (result[index].points === result[index].score) {
        row[0] = {
          content: index + 1,
          styles: {
            fontStyle: 'bold',
            fillColor: [102, 187, 106],
          },
        };
      } else if (result[index].score === 0) {
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
      row[1] = result[index].type;
      row[2] = {
        content: undefined,
        styles: {
          cellWidth: 80,
        },
      };
      if (result[index].type === 'multiple choice'
      || result[index].type === 'single choice'
      || result[index].type === 'short response'
      ) {
        row[2].content = result[index].context;
      } else if (result[index].type === 'fill in the blanks') {
        row[2].content = '';
        for (let bIndex = 0; bIndex < result[index].context.length; bIndex += 1) {
          row[2].content += result[index].context[bIndex];
          if (result[index].options[bIndex]) {
            row[2].content += ` ${bIndex + 1}.______`;
          }
        }
      } else if (result[index].type === 'matching') {
        row[2].content = `${result[index].context}\n\n`;
        for (let lIndex = 0; lIndex < result[index].leftcol.length; lIndex += 1) {
          row[2].content += `${lIndex + 1}. ${result[index].leftcol[lIndex]}\n\n`;
        }
      }

      if (result[index].type === 'multiple choice'
      || result[index].type === 'single choice'
      ) {
        row[3] = result[index].options.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
      } else if (result[index].type === 'short response') {
        row[3] = 'Not Available';
      } else if (result[index].type === 'matching') {
        row[3] = result[index].rightcol.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
      } else if (result[index].type === 'fill in the blanks') {
        row[3] = '';
        for (let bIndex = 0; bIndex < result[index].options.length; bIndex += 1) {
          row[3] += `${result[index].options[bIndex].reduce((accumulator, current, aIndex) => {
            if (aIndex !== result[index].options[bIndex].length - 1) {
              return `${accumulator}${current}, `;
            }
            return `${accumulator}${current}`;
          }, `${bIndex + 1}. `)}\n\n`;
        }
      }
      if (result[index].type === 'single choice' || result[index].type === 'short response') {
        row[4] = result[index].response;
        row[5] = result[index].answer;
      } else if (result[index].type === 'multiple choice') {
        const response = (result[index].response).sort();
        row[4] = response.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
        const answer = (result[index].answer).sort();
        row[5] = answer.reduce((accumulator, current) => `${accumulator}${current}\n\n`, '');
      } else if (result[index].type === 'matching') {
        row[4] = '';
        for (let rIndex = 0; rIndex < result[index].answer.length; rIndex += 1) {
          row[4] += `${rIndex + 1}. ${result[index].response[rIndex] || ''}\n\n`;
        }
        row[5] = '';
        for (let rIndex = 0; rIndex < result[index].answer.length; rIndex += 1) {
          row[5] += `${rIndex + 1}. ${result[index].answer[rIndex] || ''}\n\n`;
        }
      } else if (result[index].type === 'fill in the blanks') {
        row[4] = '';
        for (let bIndex = 0; bIndex < result[index].answer.length; bIndex += 1) {
          row[4] += `${bIndex + 1}. ${result[index].response[bIndex] || ''}\n\n`;
        }
        row[5] = '';
        for (let bIndex = 0; bIndex < result[index].answer.length; bIndex += 1) {
          row[5] += `${bIndex + 1}. ${result[index].answer[bIndex] || ''}\n\n`;
        }
      }
      row[6] = `${(result[index].score).toFixed(2)}/${result[index].points}`;
      tableBody[index] = row;
    }
    report.autoTable({
      head: [['ID', 'Type', 'Context', 'Options', 'Response', 'Answer', 'Score']],
      body: tableBody,
    });
    report.save('Report.pdf');
  }
}

export default PDFReport;
