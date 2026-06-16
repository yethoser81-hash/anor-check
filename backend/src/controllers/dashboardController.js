const supabase =
require("../config/supabase");

exports.overview =
async(req,res)=>{

    try{

        const {
            count:products
        }
        =
        await supabase
        .from("products")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );

        const {
            count:seals
        }
        =
        await supabase
        .from("seals")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );

        const {
            count:scans
        }
        =
        await supabase
        .from("scan_history")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );

        res.json({

            success:true,

            products,

            seals,

            scans

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }

};
exports.alerts =
async(req,res)=>{

    try{

        const {
            data,
            error
        }
        =
        await supabase
        .from("seals")
        .select("*")
        .eq(
            "suspicious",
            true
        );

        if(error){

            throw error;

        }

        res.json({

            success:true,

            alerts:data

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }

};