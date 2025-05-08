
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TutorialModalProps {
  onClose: (dontShowAgain: boolean) => void;
}

const TutorialModal = ({ onClose }: TutorialModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Dialog open={true} onOpenChange={() => onClose(dontShowAgain)}>
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-b from-green-900/90 to-green-950/90 border-green-600/50">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl text-cyan-300 mb-2">WELCOME!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-white">
          <div className="flex gap-4">
            <div className="text-green-400 font-bold text-xl">•</div>
            <div>
              <p>To perform a strike, aim with mouse, then hold and drag to pull the cue back. Release the cue to hit. The farther you pull, the stronger the hit will be.</p>
              <img 
                src="/lovable-uploads/5e5d7aeb-2e1e-4740-a6ff-09f4c538ffa3.png" 
                alt="Cue control" 
                className="w-full max-w-md mx-auto my-2"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-green-400 font-bold text-xl">•</div>
            <div>
              <p>Aiming carefully will let you choose where the next ball will go after collision. Look for the trajectory line to predict the movement.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-green-400 font-bold text-xl">•</div>
            <div>
              <p>You can add some English to alter the movement of the cue ball by using the aiming controls. Experiment with it!</p>
            </div>
          </div>

          <div className="mt-8 text-center text-cyan-300">
            See Help for more details on the rules and mechanics of the game. Enjoy!
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-tutorial" 
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <Label htmlFor="show-tutorial" className="text-white">Don't show tutorial on launch</Label>
            </div>
            
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-lg px-10"
              onClick={() => onClose(dontShowAgain)}
            >
              PLAY
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;
