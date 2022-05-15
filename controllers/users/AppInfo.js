const Apps = require('../../models/App')
const {
    checkAppRated,
    Rate1star,
    Rate2star,
    Rate3star,
    Rate4star,
    Rate5star,
    insertRate,
    checkRateStatus,
    addUserId,
    updateMyRate,
    SetRate
} = require('./Rate')

var sum = 0;
var total = 0;



async function handleRating(req) {
    if (req.body.rating1 == 1) {
        await Rate1star(req.params.appid)
    }
    if (req.body.rating1 == 2) {
        await Rate2star(req.params.appid)
    }
    if (req.body.rating1 == 3) {
        await Rate3star(req.params.appid)
    }
    if (req.body.rating1 == 4) {
        await Rate4star(req.params.appid)
    }
    if (req.body.rating1 == 5) {
        await Rate5star(req.params.appid)
    }
}

async function performRate(theStarts)
{
    let keyvalue = {
        '1': theStarts[0].oneStar,
        '2': theStarts[0].twoStar,
        '3':theStarts[0].threeStar,
        '4':theStarts[0].fourStar,
        '5':theStarts[0].fiveStar
    };
    
    for(const key in keyvalue)
    {
        total += keyvalue[key];
        sum += keyvalue[key] * parseInt(key)
    }
    return Math.round(sum / total);
}



exports.AppInfo = async (req, res) => {
    const appIds = req.params.appid;
    let ApkInfo = [];

    await Apps.ListAppsForUsers(appIds).then((result) => {console.log(result);
        ApkInfo.push([
            { appname: result[0].appName }, { dev_id: result[0].dev_id }, 
            { Rate: result[0].appRate }, { func1: result[0].funcOne },
            { func2: result[0].funcTwo }, { func3: result[0].funcThree },
            { func4: result[0].funcFour }, { Icon: '/' + result[0].icon },
            { screenshot1: '/' + result[0].screenshotOne },
            { screenshot2: '/' + result[0].screenshotTwo },
            {  screenshot3: '/' + result[0].screenshotThree},
            { app_id: result[0].appid},
            {descriptions: result[0].description}
        ])
    }).catch(err => {
        console.log(err)
    }).then(()=>{
        console.log(ApkInfo);
    res.render('users/appPage', {
        AppInfos: ApkInfo,
         });
    })
}

exports.AddRate = async (req, res,next) => {
    const checkRated = req.body.rating1;
     if(typeof checkRated != 'undefined'){
    await checkAppRated(req.params.appid).then(async appResult => {
        if (appResult.length == 0) {
            await insertRate(req.params.appid).then(async () => {
                Promise.resolve(await handleRating(req)).then(async () => {
                    await addUserId(req.params.appid, res.locals.userId)
                }).then(
                    await updateMyRate(req.params.appid).then(async theStarts => {
                        await performRate(theStarts).then(result => {
                            SetRate(result, req.params.appid)
                        })
                    })
                )
            })
        } else {
            await checkRateStatus(req.params.appid, res.locals.userId).then(async StatResult => { //check user rated the app  ?
                if (StatResult.length == 0) {
                    await insertRate(req.params.appid).then(async () => {
                        Promise.resolve(await handleRating(req)).then(async () => {
                            await addUserId(req.params.appid, res.locals.userId)
                        }).then(
                            await updateMyRate(req.params.appid).then(async theStarts => {
                                await performRate(theStarts).then(result => {
                                    SetRate(result, req.params.appid)
                                })
                            })
                           
                        )
                    })
                }
            })
        }
    })
}
    
    // }
    res.redirect('back');
    next();
}