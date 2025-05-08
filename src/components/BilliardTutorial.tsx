
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BilliardTutorialProps {
  onClose: (dontShowAgain: boolean) => void;
}

const BilliardTutorial = ({ onClose }: BilliardTutorialProps) => {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  
  return (
    <Dialog open={true} onOpenChange={() => onClose(dontShowAgain)}>
      <DialogContent className="sm:max-w-[550px] glass">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Play Billiards</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            Learn the basics of our physics-based billiards game
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-auto pr-2">
          <div>
            <h3 className="text-lg font-medium mb-2">Game Controls</h3>
            <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
              <li>Click and drag the white cue ball to aim</li>
              <li>Release to take your shot</li>
              <li>The direction and power of your shot depends on how far and which direction you drag</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Basic Rules</h3>
            <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
              <li>Break the rack by shooting the cue ball at the formation</li>
              <li>The first colored ball you pocket determines your type (solids or stripes)</li>
              <li>Pocket all of your assigned balls before sinking the 8-ball (black)</li>
              <li>If you pocket the 8-ball before clearing your balls, you lose</li>
              <li>If you pocket the cue ball ("scratch"), it resets to the starting position</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Physics Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300 list-disc pl-5">
              <li>Balls will bounce realistically off cushions and each other</li>
              <li>Use gentle shots for better control</li>
              <li>Try different angles to make complex shots</li>
              <li>Plan your next shot by considering where the cue ball will end up</li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 py-2">
          <Switch 
            id="dont-show-again" 
            checked={dontShowAgain} 
            onCheckedChange={setDontShowAgain} 
          />
          <Label htmlFor="dont-show-again">Don't show this tutorial again</Label>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onClose(dontShowAgain)}>
            Start Playing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BilliardTutorial;
