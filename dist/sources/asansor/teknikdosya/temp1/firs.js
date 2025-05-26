
import fs from 'fs';
const run = ()=>{
    const curDir = process.cwd();
    const jsonData = fs.readFileSync(`${curDir}/ozellikler.json`,'utf-8');
    const datas = JSON.parse(jsonData);
    let allData = [];
    for (let i = 0; i < JSON.parse(jsonData).length; i++) {
        const element = JSON.parse(jsonData)[i];
        allData = [...allData,...element.searchs];
        
    }
    const results = allData.reduce((acc,curr)=>{
        if(!acc.includes(curr)){
            acc.push(curr);
        }
        return acc;
    },[])
    console.log(results)
    fs.writeFileSync(curDir + '/inputs.json',JSON.stringify({
        results:results
    }));
}
run();